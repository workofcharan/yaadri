import type { ReactNode } from 'react'
import type { Dict } from '../i18n/en'
import type { Lang } from '../i18n'
import type { Role } from '../lib/types'

export type View = 'home' | 'capsules' | 'teach' | 'graph' | 'games' | 'reminders' | 'dashboard' | 'copilot'

export function Layout({
  children, dict, lang, setLang, role, setRole, view, setView, onResetDemo,
}: {
  children: ReactNode
  dict: Dict
  lang: Lang
  setLang: (l: Lang) => void
  role: Role
  setRole: (r: Role) => void
  view: View
  setView: (v: View) => void
  onResetDemo: () => void
}) {
  const caregiverNav: [View, string][] = [
    ['home', dict.nav.home], ['capsules', dict.nav.capsules], ['teach', dict.nav.teach],
    ['graph', dict.nav.graph], ['games', dict.nav.games], ['reminders', dict.nav.reminders],
    ['dashboard', dict.nav.dashboard], ['copilot', dict.nav.copilot],
  ]
  const patientNav: [View, string][] = [
    ['home', dict.nav.home], ['games', dict.nav.games], ['reminders', dict.nav.reminders], ['graph', dict.nav.graph],
  ]
  const items = role === 'caregiver' ? caregiverNav : patientNav

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-sageDark text-cream px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">{dict.appName}</h1>
          <p className="text-xs opacity-90">{dict.tagline}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="btn-secondary text-sm focus-ring"
            onClick={() => setRole(role === 'caregiver' ? 'patient' : 'caregiver')}
            aria-label={dict.role.switch}
            title={dict.role.switch}
          >
            {role === 'caregiver' ? dict.role.caregiver : dict.role.patient} ⇄
          </button>
          <button
            className="btn-secondary text-sm focus-ring"
            onClick={() => setLang(lang === 'en' ? 'as' : 'en')}
            aria-label="Toggle language / ভাষা সলনি কৰক"
          >
            {lang === 'en' ? 'অসমীয়া' : 'English'}
          </button>
        </div>
      </header>

      <nav className="bg-cream border-b border-sage/30 px-2 py-2 flex gap-1 flex-wrap" aria-label="Primary">
        {items.map(([v, label]) => (
          <button
            key={v}
            className={`px-3 py-2 rounded-lg text-sm font-medium focus-ring ${view === v ? 'bg-sageDark text-cream' : 'text-sageDark hover:bg-sage/20'}`}
            onClick={() => setView(v)}
            aria-current={view === v ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">{children}</main>

      <footer className="text-xs text-center text-ink/60 py-4 px-4">
        <p>{dict.privacy.consentNote}</p>
        <button className="underline mt-1 focus-ring" onClick={onResetDemo}>{dict.privacy.resetDemo}</button>
      </footer>
    </div>
  )
}
