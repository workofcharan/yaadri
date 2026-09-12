# Demo Script (4–5 minutes)

All data below is fictional (Shanti Sharma, 72, Guwahati; daughter
Meera; son Rahul). Say so once at the top of the demo, out loud, for
the judges.

## Isolated judge demo entry
This prototype is Local Demo mode only — every visitor's browser has
its own independent IndexedDB, so **there is no shared/real patient
record for a judge to alter.** Point judges to the same URL you're
demoing from; their session is automatically isolated by the browser.
(A separate `/judge-demo` route was **not** built in this pass — the
isolation instead comes from Local Demo mode's per-browser storage
model itself, which is documented here rather than a distinct code
path. See `ARCHITECTURE.md` "Future production work" if a distinct
demo route is wanted later.)

## Flow

**0:00 – Story entry (Teach YAADRI About Me)**
- Nav to "Teach YAADRI", click "Use demo story" (English), click
  "Extract".
- Point out the suggested person (Meera) with a source text span and
  a "Daughter" relationship suggestion.

**0:45 – Review / verification**
- Click Confirm on the suggestion.
- Say explicitly: "Nothing became verified automatically — a caregiver
  still has to Verify it as a capsule/entity, same as anything else."

**1:15 – Graph update**
- Nav to "Memory Graph". Show Meera now present, connected to existing
  verified entities (Kamakhya Temple, the birthday event).
- Click Meera's node — show the related verified memories panel.

**1:45 – Photo/voice capsule**
- Nav to "Memory Capsules" → open the "Visiting Kamakhya Temple"
  capsule → show the photo and the audio player.
- Say explicitly: "This audio is a synthetic placeholder tone, clearly
  labeled — not a real recording. A real deployment would use an
  actual caregiver-recorded voice."

**2:15 – Face-Name Recall with all five rescue levels**
- Switch role to Patient. Nav to Games → Face-Name Recall.
- Deliberately pick a wrong answer to trigger Memory Rescue.
- Click through all 5 levels (context clue → relationship hint →
  related memory/photo → familiar voice → gentle reveal), narrating
  each one, including showing what an *unavailable* cue looks like if
  you land on a person without full media.

**3:15 – Brief Connect the Memory + Memory Puzzle**
- Quickly show Connect the Memory (tap two related cards).
- Quickly show Memory Puzzle (tap-to-swap 2×2 grid), let it complete,
  answer the follow-up memory question.

**4:00 – Updated connection map / dashboard**
- Switch role back to Caregiver. Nav to Dashboard.
- Show that the session you just played appears in "Recent sessions"
  and shifted the interaction-category counts — say explicitly these
  are "application interaction categories, not a medical assessment."

**4:30 – "How was Shanti this week?"**
- Nav to Copilot, click the suggested question "How was Shanti this
  week?" — show the rule-based summary, and point at the "Rule-based
  summary" tag plus the note that optional AI wording is disabled by
  default (no credentials configured).

**4:50 – Close**
- One sentence on the honest scope: "This is a fully working local
  demo; Connected mode with real accounts and cloud storage is
  designed and documented (schema + RLS + Edge Functions) but not yet
  deployed — see TEST_REPORT.md for exactly what's verified."

## Asset provenance
All demo photos in `public/demo-assets/*.svg` are original flat-vector
illustrations authored for this project (not photographs, not sourced
from the internet — no license concerns). The placeholder audio tone
is a locally synthesized WAV (sine wave with decay), not a voice
recording of any real or fictional person.
