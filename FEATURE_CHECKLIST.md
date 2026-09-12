# Feature Checklist

Legend: ✅ implemented & locally exercised · 📄 documented/source only,
not deployed or executed · ⚠️ partial / scoped down for this pass.

| # | Feature | Files | Status | Notes / limitations |
|---|---|---|---|---|
| 1 | Memory Capsules | `src/pages/Capsules.tsx`, `src/lib/db.ts` | ✅ (photo, mic recording, upload fallback) | Mic recording uses `MediaRecorder` with format detection + stream cleanup + permission-denied fallback message. No voice cloning. Media stored as data URLs in IndexedDB (not private cloud storage — that's Connected mode, 📄). |
| 2 | Teach YAADRI About Me | `src/lib/extraction.ts`, `src/pages/Teach.tsx` | ✅ for the two bundled demo stories + close variants | Small documented pattern set (English capitalized-name heuristic + relationship-word proximity; fixed Assamese name/place lexicon). Unrecognized text is flagged, not guessed. Nothing auto-verifies — review form requires Confirm/Correct/Reject. Optional LLM path is 📄 (`supabase/functions/extract-story`). |
| 3 | Living Memory Graph | `src/pages/Graph.tsx` | ✅ | SVG graph + accessible list view, both reading live from verified `entities`/`relationships`. Pending (unverified) extractions are excluded by the `verified` filter. |
| 4a | Face-Name Recall | `src/pages/games/FaceNameRecall.tsx` | ✅ | Distinct option de-dup via filtering by id; handles <2 verified people by showing the "not enough content" state. |
| 4b | Connect the Memory | `src/pages/games/ConnectMemory.tsx` | ✅ | Tap-to-pair, keyboard-operable (native `<button>` elements); simple rounds capped at 4 pairs for a demo-length game. |
| 4c | Memory Puzzle | `src/pages/games/MemoryPuzzle.tsx` | ⚠️ | Real shuffle/placement/completion via tap-to-swap, guaranteed not pre-solved. **2×2 grid only** in this pass — 3×3 documented as future work in ARCHITECTURE.md, not implemented. |
| 5 | Five-level Memory Rescue | `src/lib/rescue.ts`, `src/components/RescueModal.tsx` | ✅ | Fixed order enforced by array order in `buildRescueLevels`. Each level's availability is computed from real data; unavailable levels are shown honestly, not skipped silently, and are distinguished from delivered levels in the logged `RescueLog`. |
| 6 | Activity logging & Memory Connection Map | `src/lib/logging.ts`, `src/pages/Dashboard.tsx` | ✅ | Idempotent event ids (`buildEventId`). Categories derived per spec. Dashboard aggregates only from `gameEvents`, separately from the Living Memory Graph. |
| 7 | Caregiver Dashboard & Copilot | `src/pages/Dashboard.tsx`, `src/pages/Copilot.tsx` | ✅ rule-based | Date-range filters (7/14/30d), honest no-data state. Copilot matches 3 documented question patterns; unsupported questions get the scope-explanation string. Optional AI wording path is 📄 (`supabase/functions/copilot-summary`) — UI clearly labels the rule-based tag and states AI is disabled by default. |
| 8 | Personalized Activity Selection | `src/lib/recommend.ts` | ✅ | Deterministic scoring from verified-content counts + recency of last play per game; each recommendation shows its factual reason. No difficulty/clinical inference. |
| 9 | Daily Reminders | `src/pages/Reminders.tsx` | ✅ | CRUD, today's list computed from `daysOfWeek`, mark-done, works fully offline since it's pure IndexedDB. No background alarms are promised (documented in-UI). |
| 10 | English & Assamese | `src/i18n/en.ts`, `src/i18n/as.ts` | ⚠️ | Core screens (nav, common actions, games, rescue, reminders, dashboard, copilot, capsules, teach, graph, privacy) translated. Flagged for fluent-speaker review — not verified by a native Assamese speaker during generation. Demo stories exist in both languages (`src/lib/seed.ts`). Verified personal names are never auto-translated (rendered as-is from data). |
| 11 | Offline core & PWA | `public/sw.js`, `public/manifest.json` | ⚠️ | App shell caching + IndexedDB persistence (real). No background sync (manual retry model only, and Local Demo mode has no server to sync with in this pass). No `vite-plugin-pwa` build-time integration — hand-written minimal service worker instead, for build-path predictability without network access. |
| 12 | Privacy & accessibility | `src/index.css`, `App.tsx` export button, footer reset | ✅ core | Reduced-motion CSS, focus-visible rings, large touch targets (Tailwind spacing), semantic roles/aria-labels on the graph and rescue modal. Export-to-JSON and reset-local-data both work. Caregiver-only actions (verify/archive/delete/reminders CRUD/dashboard/copilot) are hidden, not just disabled, in Patient role view. |
| — | Connected mode (Supabase Auth/Storage/Edge Functions/RLS) | `sql/001_init.sql`, `supabase/functions/*` | 📄 | Complete source written; **not deployed, not executed, not tested** — no Supabase project or network access existed while generating this project. Treat as a reviewed starting point only. |

## Cross-cutting requirements
- **Draft/unverified never feeds games/rescue**: enforced by filtering
  on `verified`/`status === 'verified'` everywhere games and rescue
  read entities/capsules (`FaceNameRecall.tsx`, `ConnectMemory.tsx`,
  `MemoryPuzzle.tsx`, `rescue.ts`).
- **No fabricated AI results**: no AI call is made anywhere in the
  running app; both Edge Functions are unreachable/undeployed and the
  UI never claims otherwise.
- **No broken dummy audio**: the bundled "familiar voice" is a real,
  playable, honestly-labeled synthetic tone (`src/assets/demo-tone.wav`
  via `demoAudioBase64.ts`), not a silent or corrupt file, and its
  label states clearly it is not a real voice.
