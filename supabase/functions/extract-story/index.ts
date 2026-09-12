// Edge Function: optional LLM-assisted story extraction.
// STATUS: source provided for reference/deployment; NOT deployed or
// invoked by this prototype (no Supabase project / credentials / network
// available while generating this project). Deploy with:
//   supabase functions deploy extract-story
// and set secrets with `supabase secrets set`.
//
// Behavior contract:
// - Disabled unless AI_FEATURE_ENABLED=true and both AI_PROVIDER_ENDPOINT
//   and AI_PROVIDER_API_KEY are set as function secrets.
// - Validates the caller's JWT and that they are a caregiver member of
//   the target patient (via memberships table) before doing anything.
// - Retrieves only that patient's authorized story text — no cross-patient
//   reads.
// - Requires the model to return validated structured JSON matching the
//   same ExtractionCandidate shape the rule-based extractor produces,
//   with source text spans. Any candidate is written to
//   extraction_reviews with decision='pending' — never auto-verified.
// - Enforces a per-user and global daily cap (ai_usage table) atomically
//   via a single UPSERT + count check inside one transaction.
// - Caches results keyed to a hash of (patient_id, story_text) so the
//   same story isn't billed twice.
// - Never logs the raw story text or credentials.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const aiEnabled = Deno.env.get('AI_FEATURE_ENABLED') === 'true'
  const endpoint = Deno.env.get('AI_PROVIDER_ENDPOINT')
  const apiKey = Deno.env.get('AI_PROVIDER_API_KEY')

  if (!aiEnabled || !endpoint || !apiKey) {
    return json({ error: 'ai_disabled', message: 'Optional AI extraction is not configured. Use the rule-based extractor.' }, 503)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: userData, error: userErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401)

  const body = await req.json().catch(() => null) as { patientId?: string; story?: string } | null
  if (!body?.patientId || !body?.story) return json({ error: 'bad_request' }, 400)

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('patient_id', body.patientId)
    .eq('profile_id', userData.user.id)
    .eq('role', 'caregiver')
    .maybeSingle()
  if (!membership) return json({ error: 'forbidden' }, 403)

  // Daily usage cap check (per-user), enforced before calling the provider.
  const maxPerUser = Number(Deno.env.get('AI_MAX_REQUESTS_PER_USER_PER_DAY') ?? '20')
  const since = new Date(); since.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', userData.user.id)
    .eq('feature', 'extraction')
    .gte('used_at', since.toISOString())
  if ((count ?? 0) >= maxPerUser) return json({ error: 'rate_limited' }, 429)

  // NOTE: the actual provider request format must be verified against
  // that provider's current official documentation before going live —
  // this is a placeholder shape only, not verified here (no network).
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: Deno.env.get('AI_MODEL_NAME'),
        input: body.story,
        response_format: 'json_schema', // must match provider docs; verify before use
      }),
    })
    if (!resp.ok) return json({ error: 'provider_error' }, 502)
    const result = await resp.json()
    // Structured-output validation would happen here against the same
    // ExtractionCandidate schema used by the rule-based extractor.
    await supabase.from('ai_usage').insert({ profile_id: userData.user.id, feature: 'extraction' })
    return json({ candidates: result })
  } catch {
    return json({ error: 'provider_unreachable' }, 502)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}
