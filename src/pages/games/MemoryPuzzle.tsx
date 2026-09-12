import { useMemo, useState } from 'react'
import type { Dict } from '../../i18n/en'
import type { AppData } from '../../hooks/useAppData'
import { db, newId } from '../../lib/db'
import { categorize, buildEventId } from '../../lib/logging'
import { RescueModal } from '../../components/RescueModal'
import { buildRescueLevels } from '../../lib/rescue'
import type { RescueLog } from '../../lib/types'

const GRID = 2 // 2x2 prototype grid (3x3 documented as future extension in ARCHITECTURE.md)

export function MemoryPuzzle({ dict, data, patientId, onExit, reload }: { dict: Dict; data: AppData; patientId: string; onExit: () => void; reload: () => void }) {
  const photoCapsule = useMemo(
    () => data.capsules.find((c) => c.status === 'verified' && c.title.toLowerCase().includes('celebration')) ??
      data.capsules.find((c) => c.status === 'verified' && c.photoDataUrl),
    [data.capsules],
  )

  const [sessionId] = useState(() => newId('sess'))
  const total = GRID * GRID
  const [order, setOrder] = useState<number[]>(() => {
    let arr = Array.from({ length: total }, (_, i) => i)
    // ensure a real shuffle that is NOT already solved
    do { arr = shuffle(arr) } while (arr.every((v, i) => v === i))
    return arr
  })
  const [selected, setSelected] = useState<number | null>(null)
  const [puzzleDone, setPuzzleDone] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [questionAnswered, setQuestionAnswered] = useState(false)
  const [showRescue, setShowRescue] = useState(false)
  const [rescueLog, setRescueLog] = useState<RescueLog[]>([])
  const [wrongAnswer, setWrongAnswer] = useState(false)

  if (!photoCapsule?.photoDataUrl) {
    return (
      <div className="card">
        <p>{dict.games.needMoreContent}</p>
        <button className="btn-secondary mt-3" onClick={onExit}>{dict.common.back}</button>
      </div>
    )
  }

  function tapPiece(pos: number) {
    if (puzzleDone) return
    if (selected === null) { setSelected(pos); return }
    if (selected === pos) { setSelected(null); return }
    setAttempts((a) => a + 1)
    const newOrder = [...order]
    ;[newOrder[selected], newOrder[pos]] = [newOrder[pos], newOrder[selected]]
    setOrder(newOrder)
    setSelected(null)
    if (newOrder.every((v, i) => v === i)) setPuzzleDone(true)
  }

  // dummy target entity for the follow-up memory question (uses first linked entity if any)
  const linkedEntityId = photoCapsule.entityIds[0]
  const targetEntity = data.entities.find((e) => e.id === linkedEntityId)

  async function logFinal(correct: boolean, revealed: boolean, finalRescueLog: RescueLog[]) {
    await db.gameEvents.put({
      id: buildEventId(sessionId, 'memory-puzzle', targetEntity?.id, 0),
      sessionId, patientId, gameId: 'memory-puzzle',
      startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
      outcome: 'completed', attempts, rescueLog: finalRescueLog,
      category: categorize(finalRescueLog, correct, revealed), correct, puzzleCompleted: true,
    })
    reload()
  }

  function answerQuestion(correct: boolean) {
    if (correct) {
      setQuestionAnswered(true)
      logFinal(true, false, rescueLog)
    } else if (targetEntity) {
      setWrongAnswer(true)
      setShowRescue(true)
    } else {
      setQuestionAnswered(true)
      logFinal(true, false, rescueLog)
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between text-sm text-ink/60 mb-2">
        <span>Attempts: {attempts}</span>
        <button className="underline" onClick={onExit}>{dict.common.exit}</button>
      </div>
      <p className="patient-text font-medium mb-3 text-center">{dict.games.puzzle.prompt}</p>

      {!puzzleDone && (
        <div
          className="grid gap-1 mx-auto"
          style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, width: 240, height: 240 }}
        >
          {order.map((pieceIdx, pos) => (
            <button
              key={pos}
              aria-label={`piece ${pieceIdx + 1} at position ${pos + 1}`}
              className={`focus-ring overflow-hidden border-2 ${selected === pos ? 'border-sageDark' : 'border-transparent'}`}
              style={{
                backgroundImage: `url(${photoCapsule.photoDataUrl})`,
                backgroundSize: `${GRID * 120}px ${GRID * 120}px`,
                backgroundPosition: `-${(pieceIdx % GRID) * 120}px -${Math.floor(pieceIdx / GRID) * 120}px`,
                width: 120, height: 120,
              }}
              onClick={() => tapPiece(pos)}
            />
          ))}
        </div>
      )}

      {puzzleDone && !questionAnswered && (
        <div className="text-center space-y-3">
          <p className="text-sageDark font-semibold">✓ Puzzle complete!</p>
          <img src={photoCapsule.photoDataUrl} alt={photoCapsule.title} className="mx-auto rounded-xl max-h-40" />
          {targetEntity ? (
            <div>
              <p className="patient-text mb-2">Who is connected to this memory: {targetEntity.name}?</p>
              <div className="flex gap-2 justify-center">
                <button className="btn-secondary" onClick={() => answerQuestion(true)}>{targetEntity.relationshipToPatient ?? targetEntity.name}</button>
                <button className="btn-secondary" onClick={() => answerQuestion(false)}>Not sure</button>
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => answerQuestion(true)}>{dict.common.continueLabel}</button>
          )}
        </div>
      )}

      {questionAnswered && (
        <div className="text-center mt-3">
          <p className="text-sageDark font-semibold mb-2">{dict.common.correct}!</p>
          <button className="btn-primary" onClick={onExit}>{dict.common.exit}</button>
        </div>
      )}

      {showRescue && targetEntity && (
        <RescueModal
          dict={dict}
          levels={buildRescueLevels(targetEntity, data.capsules, data.relationships, data.entities)}
          onClose={async (log) => {
            setRescueLog(log)
            setShowRescue(false)
            setQuestionAnswered(true)
            const revealed = log.some((l) => l.level === 5)
            await logFinal(true, revealed, log)
          }}
          onLog={setRescueLog}
        />
      )}
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
