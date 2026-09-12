import { useState } from 'react'
import type { RescueLevelContent } from '../lib/rescue'
import type { RescueLog } from '../lib/types'
import type { Dict } from '../i18n/en'

export function RescueModal({
  levels, dict, onClose, onLog,
}: {
  levels: RescueLevelContent[]
  dict: Dict
  onClose: (log: RescueLog[]) => void
  onLog?: (log: RescueLog[]) => void
}) {
  const [idx, setIdx] = useState(0)
  const [log, setLog] = useState<RescueLog[]>([])

  const current = levels[idx]
  const levelLabel = [dict.rescue.level1, dict.rescue.level2, dict.rescue.level3, dict.rescue.level4, dict.rescue.level5][idx]

  function next() {
    const outcome = current.available ? 'delivered' : 'unavailable'
    const newLog = [...log, { level: current.level, outcome: outcome as 'delivered' | 'unavailable' }]
    setLog(newLog)
    onLog?.(newLog)
    if (idx < levels.length - 1) setIdx(idx + 1)
    else onClose(newLog)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={levelLabel} className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full">
        <p className="text-sm text-sageDark font-semibold mb-1">{dict.rescue.needHelp} — {levelLabel} ({idx + 1}/5)</p>
        <p className="patient-text mb-4">{dict.rescue.tryAgain}</p>
        <div className="min-h-[100px] flex items-center justify-center mb-4">
          {!current.available && <p className="text-ink/70">{dict.rescue.unavailable}</p>}
          {current.available && current.render === 'text' && <p className="patient-text text-center">{current.text}</p>}
          {current.available && current.render === 'photo' && (
            <div className="text-center">
              <img src={current.photoUrl} alt={current.text ?? 'related memory'} className="rounded-xl mx-auto max-h-48" />
              <p className="mt-2">{current.text}</p>
            </div>
          )}
          {current.available && current.render === 'audio' && (
            <div className="text-center">
              <audio controls src={current.audioUrl} className="mx-auto" />
              <p className="mt-2 text-sm text-ink/70">{current.audioLabel}</p>
            </div>
          )}
          {current.render === 'reveal' && <p className="patient-text text-center font-semibold text-xl">{current.text}</p>}
        </div>
        <div className="flex justify-between gap-3">
          <button className="btn-secondary focus-ring" onClick={() => onClose(log)}>{dict.common.exit}</button>
          <button className="btn-primary focus-ring" onClick={next} autoFocus>
            {idx < levels.length - 1 ? dict.common.continueLabel : dict.common.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
