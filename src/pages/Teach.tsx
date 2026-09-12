import { useState } from 'react'
import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'
import { extractEnglish, extractAssamese, dedupeAgainstExisting } from '../lib/extraction'
import { DEMO_STORY_EN, DEMO_STORY_AS } from '../lib/seed'
import { db, newId } from '../lib/db'
import type { ExtractionCandidate } from '../lib/types'
import type { Lang } from '../i18n'

export function Teach({ dict, data, patientId, reload, lang }: { dict: Dict; data: AppData; patientId: string; reload: () => void; lang: Lang }) {
  const [story, setStory] = useState('')
  const [storyLang, setStoryLang] = useState<'en' | 'as'>('en')
  const [candidates, setCandidates] = useState<ExtractionCandidate[]>([])

  function runExtract() {
    const result = storyLang === 'en' ? extractEnglish(story) : extractAssamese(story)
    setCandidates(result)
  }

  function updateCandidate(id: string, patch: Partial<ExtractionCandidate>) {
    setCandidates((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  async function applyConfirmed() {
    const now = new Date().toISOString()
    for (const c of candidates) {
      if (c.decision !== 'confirmed' && c.decision !== 'corrected') continue
      const label = c.decision === 'corrected' ? (c.correctedLabel || c.label) : c.label
      if (!label || label.startsWith('(')) continue
      const existing = dedupeAgainstExisting(label, data.entities)
      if (existing) continue // already verified, no duplicate created
      if (c.kind === 'person' || c.kind === 'place' || c.kind === 'event') {
        await db.entities.put({
          id: newId('ent'), patientId, type: c.kind, name: label,
          relationshipToPatient: c.relationshipToPatient,
          verified: false, // caregiver still needs to Verify explicitly elsewhere — nothing auto-verifies
          createdAt: now,
        })
      }
    }
    setCandidates([])
    setStory('')
    reload()
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">{dict.teach.title}</h2>
        <div className="flex gap-2 mb-2 text-sm">
          <button className={`px-3 py-1 rounded-full border ${storyLang === 'en' ? 'bg-sageDark text-cream' : ''}`} onClick={() => setStoryLang('en')}>English</button>
          <button className={`px-3 py-1 rounded-full border ${storyLang === 'as' ? 'bg-sageDark text-cream' : ''}`} onClick={() => setStoryLang('as')}>Assamese</button>
          <button className="ml-auto underline" onClick={() => setStory(storyLang === 'en' ? DEMO_STORY_EN : DEMO_STORY_AS)}>Use demo story</button>
        </div>
        <textarea className="w-full border rounded-lg px-3 py-2 focus-ring" rows={4} value={story} placeholder={dict.teach.pasteStory} onChange={(e) => setStory(e.target.value)} />
        <button className="btn-primary mt-2" onClick={runExtract} disabled={!story.trim()}>{dict.teach.extract}</button>
      </div>

      {candidates.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-1">{dict.teach.reviewTitle}</h3>
          <p className="text-xs text-ink/60 mb-3">{dict.teach.nothingAutoVerified}</p>
          <div className="space-y-3">
            {candidates.map((c) => (
              <div key={c.id} className="bg-cream rounded-lg p-3">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <p className="font-medium">{c.kind}: {c.decision === 'corrected' ? (c.correctedLabel || c.label) : c.label}</p>
                    {c.relationshipToPatient && <p className="text-xs text-ink/60">Relationship: {c.relationshipToPatient}</p>}
                    <p className="text-xs text-ink/50">Source text: "{c.span.text}"</p>
                    {c.ambiguous && <p className="text-xs text-[#B5533C]">{dict.teach.ambiguous}</p>}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <button className={`btn-secondary text-xs ${c.decision === 'confirmed' ? '!bg-sageDark !text-cream' : ''}`} onClick={() => updateCandidate(c.id, { decision: 'confirmed' })}>{dict.common.confirm}</button>
                    <button className={`btn-secondary text-xs ${c.decision === 'rejected' ? '!bg-[#B5533C] !text-cream' : ''}`} onClick={() => updateCandidate(c.id, { decision: 'rejected' })}>{dict.common.reject}</button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 items-center">
                  <input
                    className="border rounded-lg px-2 py-1 text-sm flex-1 focus-ring"
                    placeholder="Correct label…"
                    onChange={(e) => updateCandidate(c.id, { decision: e.target.value ? 'corrected' : 'pending', correctedLabel: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-3" onClick={applyConfirmed}>{dict.common.save}</button>
        </div>
      )}
    </div>
  )
}
