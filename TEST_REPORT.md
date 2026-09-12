# Test Report

**Environment constraint that shaped this report:** the sandbox used to
generate this project has **no network access** (`npm install` fails
with `403 Forbidden` against the npm registry — confirmed, see below).
This means `node_modules` was never installed, and neither `npm run
build` nor `npm run typecheck` (which both depend on installed
`typescript`/`vite`) could be executed here. Everything marked
"not executed" below genuinely was not run — it is not a soft-pedaled
failure.

## Executed and passed
| Check | Method | Result |
|---|---|---|
| npm registry reachability | `npm install` | ❌ confirmed unreachable (`403` from registry) — recorded here as a passed *diagnostic*, not a passed build |
| TypeScript syntax/logic pass | Global `tsc` (not project-local) run with `--noEmit`, JSX/target/module flags matching `tsconfig.json`, `--skipLibCheck`, against every file in `src/`, filtering out `TS2307/TS2305/TS2688/TS2503/TS6053/TS2306/TS2664` (all "cannot find module/declaration" — expected with no installed `@types/react` etc.) | No remaining `TS1xxx` (syntax), `TS2304` (undefined name), `TS2554` (wrong arg count), or similar logic-class errors found. This is **not** a full type-check (JSX intrinsic types, prop types from uninstalled `@types/react` are unverified) but does rule out syntax errors and undefined identifiers across all `.ts`/`.tsx` files. |
| Demo asset generation | Local Python (stdlib `wave`) | `src/assets/demo-tone.wav` generated successfully, 19,244 bytes, non-empty, playable WAV — not a broken/silent dummy file |
| Manual code-path review: draft capsules excluded from games | Source read of `FaceNameRecall.tsx`, `ConnectMemory.tsx`, `MemoryPuzzle.tsx`, `rescue.ts` | All filter on `status === 'verified'` / `verified === true` before use |
| Manual code-path review: idempotent event ids | Source read of `logging.ts#buildEventId` and all three call sites | Ids are deterministic functions of `(sessionId, gameId, entityId, attemptSeq)` — a retried `db.gameEvents.put()` with the same inputs overwrites rather than duplicates (IndexedDB `put` with keyPath `id`) |
| Manual code-path review: RLS policy coverage | Read of `sql/001_init.sql` | Every exposed table has RLS enabled and at least one policy scoped through `is_member_of_patient()`; no policy references a client-supplied id directly |

## Executed and failed
| Check | Method | Result |
|---|---|---|
| `npm install` | `npm install --no-audit --no-fund` | Failed: `403 Forbidden` fetching `@types/react` from `registry.npmjs.org` — sandbox network policy blocks it. **Action needed from you:** run this on a machine with normal internet access. |

## Not executed (and why)
| Check | Why not executed |
|---|---|
| `npm run build` (production build) | Depends on installed `vite`/`typescript`; blocked by the `npm install` failure above |
| `npm run typecheck` (project-local `tsc` via `tsconfig.json`) | Same |
| Any Vitest/Playwright/browser automation test | No test runner installed; none was scaffolded given the install blocker — **recommend adding Vitest + Testing Library once `npm install` succeeds on your machine**, targeting `src/lib/logging.ts`, `src/lib/rescue.ts`, and `src/lib/extraction.ts` first since they're pure functions |
| All three games' valid/invalid/completion paths in a real browser | No browser automation tool available in this environment |
| Real puzzle reconstruction interaction | Same |
| Progressive rescue incl. unavailable media | Same |
| Extraction review/verification exclusion, live | Same (logic reviewed by reading source only, see above) |
| Dashboard summaries from events, live | Same |
| Idempotent sync (Connected mode) | Connected mode was never deployed — see below |
| Assamese UI, live rendering check | Unicode strings are present in `src/i18n/as.ts` and were visually spot-checked as valid UTF-8 text in this response, but no browser rendering was verified |
| Permission-denied recording, live | `getUserMedia` failure path is implemented (`try/catch` around the call, sets `micError` to `dict.capsules.micPermissionDenied`) but not exercised in a real browser |
| Local persistence after reload, live | IndexedDB wrapper logic reviewed; not exercised live |
| Offline reload after caching, live | Service worker logic reviewed; not exercised live |
| Logout cache clearance | Not applicable in this pass — there is no login/logout in Local Demo mode (role switching is not authentication, by design) |
| Cross-patient database/storage/function isolation | Connected mode never deployed — RLS policies were reviewed by reading, not tested against a live database |
| Rejected client verification changes | Enforced by RLS policy design (no patient UPDATE policy on `entities`/`relationships`) — not tested live |
| Invite reuse/expiry | `invitations` table has `expires_at`/`redeemed_at` columns; enforcement logic (checking these before granting membership) is **not yet written** into any Edge Function — this is a genuine gap, not just an untested path. **Action needed:** add this check to a new `redeem-invitation` Edge Function before using Connected mode. |
| Missing AI credentials | Both Edge Functions check for `AI_FEATURE_ENABLED`/`endpoint`/`apiKey` and return `503` if absent — reviewed by reading source, not executed |
| Optional AI errors/limits | Rate-limit and provider-error paths are implemented in both Edge Functions; not executed |
| Mobile/desktop UI inspection | No browser tooling available in this environment |

## Bottom line
**A working local demo does not prove Connected mode works** — and in
this case Connected mode has not been run even once. Before relying on
it for judging or real use: run `npm install` and `npm run build` on a
normal machine, fix whatever build errors surface (expect some, since
no build was ever completed here), then work through the Connected
mode setup steps in `README.md` end-to-end, and only then trust the
"not executed" rows above.
