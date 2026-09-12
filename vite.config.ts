import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: vite-plugin-pwa is listed as a devDependency and documented in
// ARCHITECTURE.md, but is intentionally NOT wired into this config to
// keep the build path verifiable without network access during
// development of this prototype. See public/sw.js for the hand-written
// service worker actually used by index.html.
export default defineConfig({
  plugins: [react()],
})
