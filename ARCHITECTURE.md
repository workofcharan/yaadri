# Architecture

## Overview
YAADRI is a single-page React + TypeScript app (Vite, Tailwind) with a
**shared typed repository interface** (`src/lib/types.ts`) meant to
back both:
- **Local Demo mode** (implemented): `src/lib/db.ts` wraps IndexedDB
  directly using those same types.
- **Connected mode** (documented only): `sql/001_init.sql` defines the
  matching Postgres schema; a Supabase-backed implementation of the
  same repository shape (e.g. `src/lib/supabaseRepo.ts`) is the natural
  next step so game/business logic (`src/lib/rescue.ts`,
  `src/lib/logging.ts`, `src/lib/recommend.ts`, `src/lib/extraction.ts`)
  never has to change or duplicate between modes.

## Request flow (Local Demo mode, as built)
UI component → `src/hooks/useAppData.ts` (loads all stores from
IndexedDB on mount, seeds fictional data on first run) → component
renders from in-memory `AppData` → user action calls `db.<store>.put/
remove` directly → caller calls `reload()` to refresh state. There is
no separate "sync" step because there is no server in this mode.

## Request flow (Connected mode, as designed but not built)
Browser → Supabase Auth (JWT) → PostgREST (RLS-filtered reads/writes
per `sql/001_init.sql` policies) for ordinary CRUD → Edge Functions
(`supabase/functions/*`) for privileged operations: invitation
redemption, membership creation, and optional AI calls, all of which
authenticate the caller server-side and never trust a client-supplied
patient/owner id.

## Data schema and graph relationships
Core entities: `patients`, `entities` (person/place/event),
`relationships` (typed edges between entities), `capsules` (the
narrative unit — story + media), `capsule_entities` (many-to-many link
table). The **Living Memory Graph** is simply `entities` +
`relationships` filtered to `verified = true`, rendered as an SVG node
graph (`src/pages/Graph.tsx`) with a list-view accessible alternative.
The **Memory Connection Map** (dashboard) is a *separate* aggregation
over `game_events`, not over `entities`/`relationships` — it answers
"how has the patient engaged", not "what do we know about them".

## Game rules and cue categories
All three games write a `GameEvent` (`src/lib/types.ts`) with an
idempotent id (`buildEventId`, deterministic from session+game+entity+
attempt sequence — retries with identical inputs don't double-count).
`src/lib/logging.ts#categorize` derives one of four **application
interaction categories** (`independent_recall`, `light_cue`,
`multiple_cues`, `revealed_no_recall`) from the rescue log — these are
explicitly *not* a clinical/diagnostic scale, and every screen that
shows them says so.

## Memory Rescue
`src/lib/rescue.ts#buildRescueLevels` derives the fixed five-level
sequence (context clue → relationship hint → related memory/photo →
familiar voice → gentle reveal) from actual verified data for the
target entity. Each level's `available` flag is computed from whether
that data actually exists (e.g. no audio capsule linked → level 4 is
honestly shown as unavailable, never fabricated). `src/components/
RescueModal.tsx` renders it and reports `delivered`/`unavailable` per
level back to the caller for logging.

## Offline limitations (honest boundary)
Local Demo mode's data already lives in IndexedDB, so "offline" mostly
falls out for free — there's no server round-trip to lose in this mode.
The service worker (`public/sw.js`) additionally caches the app shell
for offline *reload* of the page itself. What is **not** implemented:
background sync while the browser is closed, conflict resolution for
concurrent edits, or encrypted-at-rest storage guarantees. In a real
Connected-mode build, authentication, membership changes, and
authoritative verification/editing should require an online
connection unless a conflict-resolution strategy is added — this
prototype does not attempt that.

## RLS model
See the policy block at the bottom of `sql/001_init.sql`. The core
primitive is `is_member_of_patient(patient_id, role)`, checked via
`auth.uid()` against the `memberships` table — never via a
client-supplied id. Patients are only ever granted `SELECT`
(no `UPDATE` policy exists for `entities`/`relationships`/`capsules`
for the `patient` role), which is how "patients can never edit
verification" is enforced at the database layer, not just in the UI.

## Deterministic MVP vs. optional AI
Every feature works with zero AI calls: rule-based story extraction
(`src/lib/extraction.ts`), rule-based Copilot (`src/pages/Copilot.tsx`),
deterministic recommendation scoring (`src/lib/recommend.ts`). The
optional LLM path (Edge Functions in `supabase/functions/`) is
additive, server-only, disabled unless explicitly configured, and
falls back to the deterministic path on any failure — this contract is
described in each function's header comment but has not been exercised
end-to-end (no provider credentials/network at build time).

## Future production work (not attempted here)
- Wire a `supabaseRepo.ts` implementation of the shared repository
  interface and a mode switch in the UI.
- 3×3 (or larger) memory puzzle grids.
- Regional STT/TTS and broader-language NER (explicitly out of scope
  per the product brief; would need a paid dependency review).
- Background sync / service-worker push.
- Encrypted-at-rest local storage.
- A real caregiver-recorded audio fixture pipeline to replace the
  synthetic placeholder tone used in the seeded demo.
