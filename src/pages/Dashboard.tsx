import { useMemo, useState } from 'react'
import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'
import { summarizeRange } from '../lib/logging'

export function Dashboard({ dict, data }: { dict: Dict; data: AppData }) {
  const [days, setDays] = useState(7)
  const summary = useMemo(() => summarizeRange(data.gameEvents, days), [data.gameEvents, days])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">{dict.dashboard.title}</h2>
        <div className="flex gap-1 text-sm">
          {[7, 14, 30].map((d) => (
            <button key={d} className={`px-3 py-1 rounded-full border ${days === d ? 'bg-sageDark text-cream' : ''}`} onClick={() => setDays(d)}>{d}d</button>
          ))}
        </div>
      </div>

      {summary.totalEvents === 0 ? (
        <div className="card"><p className="text-ink/60">{dict.dashboard.noData}</p></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={dict.dashboard.completionRate} value={`${summary.completed}/${summary.totalEvents}`} />
            <Stat label="Independent recall" value={String(summary.byCategory.independent_recall)} />
            <Stat label={dict.dashboard.neededMoreHelp} value={String(summary.byCategory.light_cue + summary.byCategory.multiple_cues)} />
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Interaction categories (application labels, not a medical assessment)</h3>
            <ul className="text-sm space-y-1">
              <li>Independent Recall: {summary.byCategory.independent_recall}</li>
              <li>Light Cue: {summary.byCategory.light_cue}</li>
              <li>Multiple Cues: {summary.byCategory.multiple_cues}</li>
              <li>Revealed / no independent recall: {summary.byCategory.revealed_no_recall}</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">{dict.dashboard.recentSessions}</h3>
            <ul className="text-sm divide-y">
              {summary.events.slice().reverse().slice(0, 10).map((e) => (
                <li key={e.id} className="py-2 flex justify-between">
                  <span className="capitalize">{e.gameId.replace('-', ' ')}</span>
                  <span className="text-ink/60">{new Date(e.startedAt).toLocaleString()} · {e.category?.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-sageDark">{value}</p>
      <p className="text-xs text-ink/60">{label}</p>
    </div>
  )
}
