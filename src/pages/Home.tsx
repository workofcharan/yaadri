import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'
import type { Role } from '../lib/types'
import { recommendActivities } from '../lib/recommend'
import type { View } from '../components/Layout'

export function Home({ dict, data, role, setView }: { dict: Dict; data: AppData; role: Role; setView: (v: View) => void }) {
  const patient = data.patients[0]
  const recs = recommendActivities(data.entities, data.capsules, data.gameEvents)

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">
          {role === 'caregiver' ? `Hello — managing memories for ${patient?.name ?? '...'}` : `Hello, ${patient?.name ?? ''}`}
        </h2>
        <p className="text-ink/70 text-sm">
          {dict.privacy.consentNote}
        </p>
      </div>

      {role === 'caregiver' && (
        <div className="card">
          <h3 className="font-semibold mb-2">Suggested next activity</h3>
          {recs.length === 0 && <p className="text-ink/60">{dict.common.empty}</p>}
          <ul className="space-y-2">
            {recs.slice(0, 3).map((r) => (
              <li key={r.gameId} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2">
                <div>
                  <p className="font-medium capitalize">{r.gameId.replace('-', ' ')}</p>
                  <p className="text-xs text-ink/60">{r.reason}</p>
                </div>
                <button className="btn-secondary text-sm" onClick={() => setView('games')}>{dict.common.start}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button className="card text-left hover:shadow-md focus-ring" onClick={() => setView('games')}>
          <p className="font-semibold">{dict.nav.games}</p>
          <p className="text-sm text-ink/60">{dict.games.faceName.title}, {dict.games.connect.title}, {dict.games.puzzle.title}</p>
        </button>
        <button className="card text-left hover:shadow-md focus-ring" onClick={() => setView('graph')}>
          <p className="font-semibold">{dict.nav.graph}</p>
          <p className="text-sm text-ink/60">{data.entities.filter((e) => e.verified).length} verified people/places/events</p>
        </button>
        {role === 'caregiver' && (
          <>
            <button className="card text-left hover:shadow-md focus-ring" onClick={() => setView('capsules')}>
              <p className="font-semibold">{dict.nav.capsules}</p>
              <p className="text-sm text-ink/60">{data.capsules.length} capsules ({data.capsules.filter(c=>c.status==='verified').length} verified)</p>
            </button>
            <button className="card text-left hover:shadow-md focus-ring" onClick={() => setView('dashboard')}>
              <p className="font-semibold">{dict.nav.dashboard}</p>
              <p className="text-sm text-ink/60">{data.gameEvents.length} logged activity events</p>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
