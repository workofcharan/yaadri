import { useState } from 'react'
import { Layout, type View } from './components/Layout'
import { Home } from './pages/Home'
import { Capsules } from './pages/Capsules'
import { Teach } from './pages/Teach'
import { Graph } from './pages/Graph'
import { Games } from './pages/Games'
import { Reminders } from './pages/Reminders'
import { Dashboard } from './pages/Dashboard'
import { Copilot } from './pages/Copilot'
import { useAppData } from './hooks/useAppData'
import { t } from './i18n'

export default function App() {
  const { data, loading, error, reload, resetDemo, role, setRole, lang, setLang, patientId } = useAppData()
  const [view, setView] = useState<View>('home')
  const dict = t(lang)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/60">{dict.common.loading}</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-[#B5533C] font-medium">{dict.common.error}</p>
        <p className="text-sm text-ink/60">{error}</p>
        <button className="btn-primary" onClick={reload}>{dict.common.retry}</button>
      </div>
    )
  }

  return (
    <Layout dict={dict} lang={lang} setLang={setLang} role={role} setRole={setRole} view={view} setView={setView} onResetDemo={resetDemo}>
      {view === 'home' && <Home dict={dict} data={data} role={role} setView={setView} />}
      {view === 'capsules' && <Capsules dict={dict} data={data} patientId={patientId} role={role} reload={reload} />}
      {view === 'teach' && <Teach dict={dict} data={data} patientId={patientId} reload={reload} lang={lang} />}
      {view === 'graph' && <Graph dict={dict} data={data} />}
      {view === 'games' && <Games dict={dict} data={data} patientId={patientId} reload={reload} />}
      {view === 'reminders' && <Reminders dict={dict} data={data} patientId={patientId} role={role} reload={reload} />}
      {view === 'dashboard' && role === 'caregiver' && <Dashboard dict={dict} data={data} />}
      {view === 'copilot' && role === 'caregiver' && <Copilot dict={dict} data={data} />}

      {role === 'caregiver' && (view === 'dashboard' || view === 'capsules') && (
        <div className="mt-6 flex gap-3 text-sm">
          <button className="underline text-ink/60" onClick={() => exportData(data)}>{dict.privacy.exportData}</button>
        </div>
      )}
    </Layout>
  )
}

function exportData(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'yaadri-local-demo-export.json'
  a.click()
  URL.revokeObjectURL(url)
}
