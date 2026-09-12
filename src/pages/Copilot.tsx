import { useState } from 'react'
import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'
import { summarizeRange } from '../lib/logging'

interface Turn { question: string; answer: string; tag: 'rule' }

const SUGGESTED = [
  'How was Shanti this week?',
  'Which memories needed more help?',
  'What activities were completed?',
]

export function Copilot({ dict, data }: { dict: Dict; data: AppData }) {
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])

  function answer(question: string): string {
    const q = question.toLowerCase()
    if (q.includes('this week') || q.includes('how was')) {
      const s = summarizeRange(data.gameEvents, 7)
      if (s.totalEvents === 0) return 'No activity was recorded in the last 7 days.'
      return `In the last 7 days: ${s.totalEvents} activities logged, ${s.completed} completed. ` +
        `${s.byCategory.independent_recall} recalled independently, ${s.byCategory.light_cue} with a light cue, ${s.byCategory.multiple_cues} needed multiple cues.`
    }
    if (q.includes('needed more help') || q.includes('more assistance') || q.includes('more help')) {
      const s = summarizeRange(data.gameEvents, 14)
      const needMore = s.events.filter((e) => e.category === 'multiple_cues' || e.category === 'revealed_no_recall')
      if (needMore.length === 0) return 'No activities in the last 14 days needed multiple cues or a full reveal.'
      const names = needMore.map((e) => e.entityId ? (data.entities.find((en) => en.id === e.entityId)?.name ?? e.gameId) : e.gameId)
      return `${needMore.length} activities in the last 14 days needed more assistance, related to: ${[...new Set(names)].join(', ')}.`
    }
    if (q.includes('completed') || q.includes('activities')) {
      const s = summarizeRange(data.gameEvents, 7)
      const byGame = Object.entries(s.byGame).map(([g, n]) => `${g.replace('-', ' ')}: ${n}`).join(', ')
      return s.totalEvents === 0 ? 'No activities completed in the last 7 days.' : `Activities in the last 7 days — ${byGame || 'none'}.`
    }
    return dict.copilot.unsupported
  }

  function ask(q: string) {
    if (!q.trim()) return
    const a = answer(q)
    setTurns((t) => [...t, { question: q, answer: a, tag: 'rule' }])
    setInput('')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{dict.copilot.title}</h2>
      <div className="flex gap-2 flex-wrap">
        {SUGGESTED.map((s) => (
          <button key={s} className="btn-secondary text-sm" onClick={() => ask(s)}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {turns.map((t, i) => (
          <div key={i} className="card">
            <p className="font-medium">{t.question}</p>
            <p className="text-sm text-ink/80 mt-1">{t.answer}</p>
            <span className="text-xs text-sageDark">{dict.copilot.ruleBasedTag}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus-ring"
          placeholder={dict.copilot.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(input)}
        />
        <button className="btn-primary" onClick={() => ask(input)}>Ask</button>
      </div>
      <p className="text-xs text-ink/50">
        Optional AI-worded summaries are disabled by default in this prototype (no AI credentials configured); see ARCHITECTURE.md.
      </p>
    </div>
  )
}
