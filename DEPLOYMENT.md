# Deployment

## Static hosting (frontend)
`npm run build` produces a static SPA in `dist/`. Deploy `dist/` to any
static host:

- **Vercel / Netlify**: connect the repo, build command `npm run
  build`, output directory `dist`. Both auto-provision HTTPS.
- **Cloudflare Pages**: same build command/output directory.
- **GitHub Pages**: works for static hosting but needs a custom domain
  or the repo-name subpath configured in `vite.config.ts`'s `base`
  option for HTTPS + correct asset paths (not currently set — add if
  you use this host).

### SPA fallback
This prototype uses in-app state (not the URL) to switch screens, so
there are no deep-linkable routes yet and no fallback rule is strictly
required today. If URL-based routing is added later, configure a
catch-all rewrite to `index.html` on whichever host you pick (e.g.
Vercel's default SPA handling, or a `_redirects` file `/* /index.html
200` on Netlify).

### HTTPS / media permissions
Microphone recording (`getUserMedia`) and reliable service-worker
registration require HTTPS (or `localhost` during development). All
hosts listed above provide HTTPS automatically.

### QR code
After deployment, run:
```bash
npm run qr -- https://your-real-deployed-url.example.com
```
This writes `yaadri-qr.png`. Test it by scanning with a phone camera.
**No deployment or QR generation was performed as part of building
this prototype** — no live URL exists yet; do not present a
fabricated one to judges.

## Connected mode (Supabase) — see README.md
The full Supabase setup path (project creation, migrations, auth
redirects, storage, Edge Function deployment) is documented in
`README.md`'s "Connected mode setup" section. It was written out
completely but **not executed or verified** — no Supabase credentials
or network access existed in the environment that generated this
project. Treat every step there as unverified until your team runs it.

## Portability note
Nothing here depends on a specific host beyond "static file hosting
with HTTPS" for the frontend and "a Supabase project" for Connected
mode — both are portable, standard choices for a 4-day hackathon.
