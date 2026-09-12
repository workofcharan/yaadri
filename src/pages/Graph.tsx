import { useState } from 'react'
import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'

export function Graph({ dict, data }: { dict: Dict; data: AppData }) {
  const [view, setView] = useState<'graph' | 'list'>('graph')
  const [selected, setSelected] = useState<string | null>(null)

  const verifiedEntities = data.entities.filter((e) => e.verified)
  const verifiedRels = data.relationships.filter((r) => r.verified)

  const positions = layoutCircle(verifiedEntities.map((e) => e.id), 160, 200, 200)

  const selectedEntity = verifiedEntities.find((e) => e.id === selected)
  const relatedCapsules = selectedEntity
    ? data.capsules.filter((c) => c.status === 'verified' && c.entityIds.includes(selectedEntity.id))
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{dict.graph.title}</h2>
        <div className="flex gap-2 text-sm">
          <button className={`px-3 py-1 rounded-full border ${view === 'graph' ? 'bg-sageDark text-cream' : ''}`} onClick={() => setView('graph')}>{dict.graph.graphView}</button>
          <button className={`px-3 py-1 rounded-full border ${view === 'list' ? 'bg-sageDark text-cream' : ''}`} onClick={() => setView('list')}>{dict.graph.listView}</button>
        </div>
      </div>

      {view === 'graph' ? (
        <div className="card overflow-auto">
          <svg viewBox="0 0 400 400" width="100%" height="360" role="img" aria-label="Living memory graph">
            {verifiedRels.map((r) => {
              const a = positions[r.fromEntityId]; const b = positions[r.toEntityId]
              if (!a || !b) return null
              return <line key={r.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8FA98D" strokeWidth={2} />
            })}
            {verifiedEntities.map((e) => {
              const p = positions[e.id]
              const color = e.type === 'person' ? '#B5533C' : e.type === 'place' ? '#4C7A6E' : '#4A5A8F'
              return (
                <g key={e.id} tabIndex={0} role="button" aria-label={e.name}
                   onClick={() => setSelected(e.id)}
                   onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') setSelected(e.id) }}
                   style={{ cursor: 'pointer' }}>
                  <circle cx={p.x} cy={p.y} r={selected === e.id ? 26 : 20} fill={color} stroke={selected === e.id ? '#2B2620' : 'none'} strokeWidth={2} />
                  <text x={p.x} y={p.y + 36} textAnchor="middle" fontSize="11" fill="#2B2620">{e.name}</text>
                </g>
              )
            })}
          </svg>
          {!selectedEntity && <p className="text-sm text-ink/60 mt-2">{dict.graph.selectPrompt}</p>}
        </div>
      ) : (
        <ul className="space-y-2">
          {verifiedEntities.map((e) => (
            <li key={e.id}>
              <button className={`card w-full text-left ${selected === e.id ? 'ring-2 ring-sageDark' : ''}`} onClick={() => setSelected(e.id)}>
                <span className="font-medium">{e.name}</span>
                <span className="text-xs text-ink/50 ml-2 capitalize">{e.type}{e.relationshipToPatient ? ` · ${e.relationshipToPatient}` : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedEntity && (
        <div className="card">
          <h3 className="font-semibold mb-2">{selectedEntity.name} — related verified memories</h3>
          {relatedCapsules.length === 0 && <p className="text-ink/60 text-sm">{dict.common.empty}</p>}
          <div className="grid grid-cols-2 gap-3">
            {relatedCapsules.map((c) => (
              <div key={c.id} className="bg-cream rounded-lg p-2">
                {c.photoDataUrl && <img src={c.photoDataUrl} alt={c.title} className="rounded-lg max-h-24 mb-1" />}
                <p className="text-sm font-medium">{c.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function layoutCircle(ids: string[], radius: number, cx: number, cy: number) {
  const pos: Record<string, { x: number; y: number }> = {}
  ids.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(ids.length, 1)
    pos[id] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  })
  return pos
}
