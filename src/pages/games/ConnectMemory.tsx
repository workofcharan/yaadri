import { useMemo, useState } from 'react'
import type { Dict } from '../../i18n/en'
import type { AppData } from '../../hooks/useAppData'
import { db, newId } from '../../lib/db'
import { categorize, buildEventId } from '../../lib/logging'

interface Pair { id: string; leftLabel: string; rightLabel: string }

export function ConnectMemory({ dict, data, patientId, onExit, reload }: { dict: Dict; data: AppData; patientId: string; onExit: () => void; reload: () => void }) {
  const pairs: Pair[] = useMemo(() => {
    const verifiedRels = data.relationships.filter((r) => r.verified)
    const byEntity = new Map(data.entities.map((e) => [e.id, e]))
    const seen = new Set<string>()
    const out: Pair[] = []
    for (const r of verifiedRels) {
      const from = byEntity.get(r.fromEntityId)
      const to = byEntity.get(r.toEntityId)
      if (!from || !to) continue
      const key = [from.name, to.name].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ id: r.id, leftLabel: from.name, rightLabel: to.name })
    }
    return out.slice(0, 4)
  }, [data.relationships, data.entities])

  const [sessionId] = useState(() => newId('sess'))
  const [leftPick, setLeftPick] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [attempts, setAttempts] = useState(0)
  const [wrongFlash, setWrongFlash] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const lefts = useMemo(() => shuffle(pairs.map((p) => ({ id: p.id, label: p.leftLabel }))), [pairs])
  const rights = useMemo(() => shuffle(pairs.map((p) => ({ id: p.id, label: p.rightLabel }))), [pairs])

  if (pairs.length < 2) {
    return (
      <div className="card">
        <p>{dict.games.needMoreContent}</p>
        <button className="btn-secondary mt-3" onClick={onExit}>{dict.common.back}</button>
      </div>
    )
  }

  async function finish() {
    setDone(true)
    await db.gameEvents.put({
      id: buildEventId(sessionId, 'connect-memory', undefined, 0),
      sessionId, patientId, gameId: 'connect-memory',
      startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
      outcome: 'completed', attempts, rescueLog: [], category: categorize([], true, false), correct: true,
    })
    reload()
  }

  function pickRight(rightId: string, pairId: string) {
    if (!leftPick) return
    setAttempts((a) => a + 1)
    if (leftPick === pairId && rightId === pairId) {
      const next = new Set(matched); next.add(pairId); setMatched(next)
      setLeftPick(null)
      if (next.size === pairs.length) finish()
    } else {
      setWrongFlash(rightId)
      setTimeout(() => setWrongFlash(null), 500)
      setLeftPick(null)
    }
  }

  if (done) {
    return (
      <div className="card text-center">
        <h3 className="font-semibold text-lg mb-2">Well done!</h3>
        <p>Matched all {pairs.length} pairs in {attempts} attempts.</p>
        <button className="btn-primary mt-3" onClick={onExit}>{dict.common.exit}</button>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between text-sm text-ink/60 mb-2">
        <span>{matched.size}/{pairs.length} matched</span>
        <button className="underline" onClick={onExit}>{dict.common.exit}</button>
      </div>
      <p className="patient-text font-medium mb-3 text-center">{dict.games.connect.prompt}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {lefts.filter((l) => !matched.has(l.id)).map((l) => (
            <button key={l.id} className={`btn-secondary w-full focus-ring ${leftPick === l.id ? '!bg-sageDark !text-cream' : ''}`} onClick={() => setLeftPick(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rights.filter((r) => !matched.has(r.id)).map((r) => (
            <button key={r.id} className={`btn-secondary w-full focus-ring ${wrongFlash === r.id ? '!bg-[#B5533C] !text-cream' : ''}`} onClick={() => pickRight(r.id, r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
