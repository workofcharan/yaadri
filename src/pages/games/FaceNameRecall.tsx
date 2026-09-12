import { useMemo, useState } from 'react'
import type { Dict } from '../../i18n/en'
import type { AppData } from '../../hooks/useAppData'
import { buildRescueLevels } from '../../lib/rescue'
import { RescueModal } from '../../components/RescueModal'
import { categorize, buildEventId } from '../../lib/logging'
import { db, newId } from '../../lib/db'
import type { RescueLog } from '../../lib/types'

export function FaceNameRecall({ dict, data, patientId, onExit, reload }: { dict: Dict; data: AppData; patientId: string; onExit: () => void; reload: () => void }) {
  const people = useMemo(() => data.entities.filter((e) => e.type === 'person' && e.verified), [data.entities])
  const portraitFor = (id: string) => data.capsules.find((c) => c.status === 'verified' && c.entityIds.includes(id) && c.title.toLowerCase().includes('portrait'))
    ?? data.capsules.find((c) => c.status === 'verified' && c.entityIds.includes(id) && c.photoDataUrl)

  const [sessionId] = useState(() => newId('sess'))
  const [round, setRound] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [rescueLog, setRescueLog] = useState<RescueLog[]>([])
  const [showRescue, setShowRescue] = useState(false)
  const [status, setStatus] = useState<'playing' | 'correct' | 'done'>('playing')
  const [score, setScore] = useState(0)

  if (people.length < 2) {
    return (
      <div className="card">
        <p>{dict.games.needMoreContent}</p>
        <button className="btn-secondary mt-3" onClick={onExit}>{dict.common.back}</button>
      </div>
    )
  }

  const target = people[round % people.length]
  const portrait = portraitFor(target.id)
  const distractors = people.filter((p) => p.id !== target.id).slice(0, 2)
  const options = useMemo(() => shuffle([target, ...distractors]), [target.id])

  async function logEvent(correct: boolean, revealed: boolean, finalRescueLog: RescueLog[]) {
    const category = categorize(finalRescueLog, correct, revealed)
    await db.gameEvents.put({
      id: buildEventId(sessionId, 'face-name', target.id, round),
      sessionId, patientId, gameId: 'face-name', entityId: target.id,
      startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
      outcome: 'completed', attempts: attempts + 1, rescueLog: finalRescueLog, category, correct,
    })
    reload()
  }

  async function choose(optionId: string) {
    if (status !== 'playing') return
    setAttempts((a) => a + 1)
    if (optionId === target.id) {
      setStatus('correct')
      setScore((s) => s + (rescueLog.length === 0 ? 2 : 1))
      await logEvent(true, false, rescueLog)
    } else {
      setShowRescue(true)
    }
  }

  function nextRound() {
    if (round + 1 >= people.length) {
      setStatus('done')
    } else {
      setRound((r) => r + 1)
      setAttempts(0)
      setRescueLog([])
      setStatus('playing')
    }
  }

  if (status === 'done') {
    return (
      <div className="card text-center">
        <h3 className="font-semibold text-lg mb-2">Well done!</h3>
        <p>Score: {score}</p>
        <div className="flex gap-2 justify-center mt-3">
          <button className="btn-secondary" onClick={() => { setRound(0); setScore(0); setStatus('playing') }}>{dict.common.restart}</button>
          <button className="btn-primary" onClick={onExit}>{dict.common.exit}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between text-sm text-ink/60 mb-2">
        <span>Round {round + 1}/{people.length}</span>
        <button className="underline" onClick={onExit}>{dict.common.exit}</button>
      </div>
      <p className="patient-text font-medium mb-3 text-center">{dict.games.faceName.prompt}</p>
      {portrait?.photoDataUrl && <img src={portrait.photoDataUrl} alt="person to recall" className="mx-auto rounded-xl max-h-48 mb-4" />}
      {!portrait && <p className="text-center text-ink/60 mb-4">(No portrait photo available for this person yet.)</p>}
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => (
          <button key={o.id} className="btn-secondary focus-ring text-lg" onClick={() => choose(o.id)} disabled={status !== 'playing'}>
            {o.name}
          </button>
        ))}
      </div>
      {status === 'correct' && (
        <div className="mt-3 text-center">
          <p className="text-sageDark font-semibold mb-2">✓ {dict.common.correct}</p>
          <button className="btn-primary" onClick={nextRound}>{dict.common.continueLabel}</button>
        </div>
      )}
      {showRescue && (
        <RescueModal
          dict={dict}
          levels={buildRescueLevels(target, data.capsules, data.relationships, data.entities)}
          onClose={async (log) => {
            setRescueLog(log)
            setShowRescue(false)
            const revealed = log.some((l) => l.level === 5)
            setStatus('correct')
            await logEvent(true, revealed, log)
          }}
          onLog={setRescueLog}
        />
      )}
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
