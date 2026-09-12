// Edge Function: optional AI-worded Copilot summary.
// STATUS: source provided for reference/deployment; NOT deployed or
// invoked by this prototype. Same auth/authorization/cap pattern as
// extract-story — see that file's header comment for the full contract.
//
// Critical constraint: this function receives ONLY pre-computed
// aggregate numbers/log evidence from the caller (already authorized
// and RLS-filtered) — it must preserve those numbers verbatim and may
// only change wording. On any failure it must be safe to fall back to
// the deterministic rule-based summary already shown in the UI.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const aiEnabled = Deno.env.get('AI_FEATURE_ENABLED') === 'true'
  const endpoint = Deno.env.get('AI_PROVIDER_ENDPOINT')
  const apiKey = Deno.env.get('AI_PROVIDER_API_KEY')
  if (!aiEnabled || !endpoint || !apiKey) {
    return json({ error: 'ai_disabled', message: 'Falls back to deterministic summary.' }, 503)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const { data: userData, error: userErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401)

  const body = await req.json().catch(() => null) as { patientId?: string; aggregate?: unknown } | null
  if (!body?.patientId || !body?.aggregate) return json({ error: 'bad_request' }, 400)

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('patient_id', body.patientId)
    .eq('profile_id', userData.user.id)
    .eq('role', 'caregiver')
    .maybeSingle()
  if (!membership) return json({ error: 'forbidden' }, 403)

  const maxPerUser = Number(Deno.env.get('AI_MAX_REQUESTS_PER_USER_PER_DAY') ?? '20')
  const since = new Date(); since.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('ai_usage').select('id', { count: 'exact', head: true })
    .eq('profile_id', userData.user.id).eq('feature', 'copilot_summary').gte('used_at', since.toISOString())
  if ((count ?? 0) >= maxPerUser) return json({ error: 'rate_limited' }, 429)

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: Deno.env.get('AI_MODEL_NAME'),
        instructions: 'Reword the following pre-computed aggregate evidence into a warm one-paragraph summary. Do not change any numbers. Do not add trends or diagnoses not present in the data.',
        input: body.aggregate,
      }),
    })
    if (!resp.ok) return json({ error: 'provider_error' }, 502)
    const result = await resp.json()
    await supabase.from('ai_usage').insert({ profile_id: userData.user.id, feature: 'copilot_summary' })
    return json({ summary: result })
  } catch {
    return json({ error: 'provider_unreachable' }, 502)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}
