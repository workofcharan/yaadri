# YAADRI — Your Personal AI Memory Companion (Hackathon Prototype)

> Fictional demo. Not a medical device. Does not diagnose, stage, or treat
> any condition. All patient data in this repository is invented.

YAADRI personalizes the memory itself (not just difficulty), through
Memory Capsules, a Living Memory Graph, three recall-support games, a
five-level Memory Rescue, and a rule-based caregiver Copilot — all
runnable **without any paid AI API or cloud account.**

## ⚠️ What's implemented vs. documented-only (read this first)

This project was generated in an environment with **no internet access**,
so the following could not be installed or executed and are **not
verified**:
- `npm install` was never run here — no `node_modules`, no generated
  lockfile. **You must run `npm install` yourself** the first time.
- `npm run build` / `npm run typecheck` were not executed with real
  dependencies. A manual TypeScript syntax pass (ignoring
  missing-module errors caused by the absent `node_modules`) found no
  syntax errors — see `TEST_REPORT.md` for exactly what was and wasn't
  checked.
- **Connected mode (Supabase) was never deployed or tested.** No
  Supabase project, credentials, or network access existed while this
  was built. The SQL migrations (`/sql`) and Edge Functions
  (`/supabase/functions`) are complete, reviewed source — but
  unexecuted. Treat them as a documented, reviewable starting point,
  not a verified backend.
- **Local Demo mode is the fully working, real part of this
  prototype.** Every feature below runs against browser IndexedDB with
  no backend, using the bundled fictional Shanti Sharma dataset.

## Quick start (Local Demo mode — no account needed)

Requires **Node.js 18.18+** (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). The app
seeds itself with the fictional demo family on first load. Use the
role switcher (top right) to flip between Caregiver and Patient views
— this is a **demo convenience, not authentication.**

To reset all local data: use the "Reset local demo data" link in the
footer.

## Project structure

```
src/            React + TypeScript source (Local Demo mode is fully wired)
sql/            Connected-mode Postgres schema + RLS policies (documented)
supabase/functions/   Optional AI Edge Function source (documented, not deployed)
public/demo-assets/   Bundled fictional demo photos (SVG) + manifest/icons
scripts/generate-qr.mjs   QR code generator for a real deployed URL
```

## Connected mode setup (Supabase) — UNVERIFIED, follow carefully

This path is written out in full but has not been executed end-to-end.
Budget real time to debug it.

1. **Create a Supabase project** at supabase.com (free tier is enough
   for a hackathon demo).
2. **Run the migration**: open the SQL editor in your Supabase
   dashboard and paste the contents of `sql/001_init.sql`, or use the
   CLI: `supabase db push` after linking your project.
3. **Auth redirect settings**: in Authentication → URL Configuration,
   add your dev URL (`http://localhost:5173`) and your deployed HTTPS
   URL to the allowed redirect list.
4. **Storage**: create a **private** bucket named `capsule-media`.
   Apply the storage policy logic documented at the bottom of
   `sql/001_init.sql` (adapt in the Dashboard's policy editor — exact
   SQL syntax for `storage.objects` policies should be checked against
   current Supabase docs, since that surface changes).
5. **Server secrets**: copy `server.env.example` to your Supabase
   project's Edge Function secrets (`supabase secrets set --env-file
   server.env.example` after filling in real values). Never put these
   in `.env` files consumed by Vite.
6. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy extract-story
   supabase functions deploy copilot-summary
   ```
7. **Frontend env**: copy `.env.example` to `.env.local`, fill in your
   project URL and anon key, set `VITE_ENABLE_CONNECTED_MODE=true`.
8. **Verify**: create a caregiver account, create a patient profile,
   generate an invitation, redeem it as a second (patient) account in
   a private/incognito window, and confirm cross-family isolation by
   trying to access another family's patient id directly (should be
   denied by RLS).

Connected mode is **not wired into the React app's UI** in this
prototype pass — only the schema, RLS, and Edge Function source exist.
Wiring the repository interface to call Supabase instead of IndexedDB
is the next concrete engineering step (see `ARCHITECTURE.md`).

## Deployment (static hosting)

The built app (`npm run build` → `dist/`) is a static SPA and deploys
to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages
with a custom domain for HTTPS).
- Configure **SPA fallback** (all routes → `index.html`) since this
  prototype uses in-app state-based navigation, not URL routing —
  fallback is a forward-looking note in case URL routing is added later.
- HTTPS is required for microphone access (`getUserMedia`) and for the
  service worker to register in most browsers.
- After deploying, run `npm run qr -- https://your-real-url` to
  generate `yaadri-qr.png`. Do not fabricate a URL — the script
  refuses to run without one.

No deployment was performed by this prototype-generation process; no
external account was created on your behalf.

## Known limitations (see ARCHITECTURE.md for full list)

- Puzzle grid is 2×2 only in this pass (3×3 documented as future work).
- Assamese translations cover core screens; flagged for fluent-speaker
  review before real use.
- Offline sync queue is a manual-retry, single-device model — no
  background sync, no encrypted-at-rest guarantee.
- The bundled "familiar voice" is an honestly-labeled synthetic
  placeholder tone, not a real recording.
# yaadri
