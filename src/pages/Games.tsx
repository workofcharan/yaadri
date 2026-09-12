import { useState } from 'react'
import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'
import { FaceNameRecall } from './games/FaceNameRecall'
import { ConnectMemory } from './games/ConnectMemory'
import { MemoryPuzzle } from './games/MemoryPuzzle'

type GameChoice = 'menu' | 'face-name' | 'connect-memory' | 'memory-puzzle'

export function Games({ dict, data, patientId, reload }: { dict: Dict; data: AppData; patientId: string; reload: () => void }) {
  const [choice, setChoice] = useState<GameChoice>('menu')

  if (choice === 'face-name') return <FaceNameRecall dict={dict} data={data} patientId={patientId} onExit={() => setChoice('menu')} reload={reload} />
  if (choice === 'connect-memory') return <ConnectMemory dict={dict} data={data} patientId={patientId} onExit={() => setChoice('menu')} reload={reload} />
  if (choice === 'memory-puzzle') return <MemoryPuzzle dict={dict} data={data} patientId={patientId} onExit={() => setChoice('menu')} reload={reload} />

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{dict.nav.games}</h2>
      <button className="card w-full text-left hover:shadow-md focus-ring" onClick={() => setChoice('face-name')}>
        <p className="font-semibold">{dict.games.faceName.title}</p>
      </button>
      <button className="card w-full text-left hover:shadow-md focus-ring" onClick={() => setChoice('connect-memory')}>
        <p className="font-semibold">{dict.games.connect.title}</p>
      </button>
      <button className="card w-full text-left hover:shadow-md focus-ring" onClick={() => setChoice('memory-puzzle')}>
        <p className="font-semibold">{dict.games.puzzle.title}</p>
      </button>
    </div>
  )
}
