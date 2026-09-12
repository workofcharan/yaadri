# Windows Setup (beginner-friendly)

## 1. Install prerequisites
1. Install **Node.js 20 LTS** from nodejs.org (the Windows installer
   sets up `node` and `npm` for you — accept the defaults).
2. Install **VS Code** from code.visualstudio.com.
3. (Optional but recommended) Install **Git for Windows** if you'll use
   version control.

## 2. Extract the project
1. Right-click `YAADRI.zip` → "Extract All…" → choose a simple path
   like `C:\Projects\YAADRI`.
2. Open VS Code → File → Open Folder… → select the extracted `yaadri`
   folder.

## 3. Install dependencies
Open a terminal in VS Code (Terminal → New Terminal) and run:
```powershell
npm install
```
This downloads the packages listed in `package.json`. It requires
internet access. If it fails with a permissions or proxy error, check
your network/firewall settings.

## 4. Run the credential-free local demo
```powershell
npm run dev
```
VS Code will show a local address like `http://localhost:5173/` —
Ctrl+Click it (or paste into your browser) to open the app. No
Supabase account, API key, or internet connection is required for this
mode.

## 5. Stopping the app
Press `Ctrl + C` in the terminal.

## Troubleshooting
- **"npm is not recognized"**: Node.js wasn't installed correctly, or
  you need to restart VS Code/your terminal after installing it.
- **Blank page in browser**: check the terminal for a red error message
  and the browser DevTools console (F12).
- **Microphone recording doesn't work**: browsers require `https://` or
  `localhost` for microphone access — `localhost` from `npm run dev`
  is fine; a plain IP address is not.
- For Connected mode (Supabase) setup, see `README.md` and
  `DEPLOYMENT.md` — that path is documented but was not tested by the
  team that generated this prototype, due to no network access at
  generation time.
