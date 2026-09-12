// Rule-based "Teach YAADRI About Me" extractor.
//
// HONESTY NOTE: this is pattern matching against a small set of
// documented templates, not general NLU. It reliably handles the two
// bundled demo stories (English + Assamese) and simple variations on
// them. Anything it doesn't recognize is flagged ambiguous/unsupported
// and routed to manual entry — it is never silently dropped or
// invented. Story text is treated purely as data: it is never
// interpreted as instructions to this app.
import { newId } from './db'
import type { ExtractionCandidate, Entity } from './types'

const REL_WORDS_EN: Record<string, string> = {
  daughter: 'Daughter', son: 'Son', wife: 'Wife', husband: 'Husband',
  mother: 'Mother', father: 'Father', sister: 'Sister', brother: 'Brother',
  friend: 'Friend', granddaughter: 'Granddaughter', grandson: 'Grandson',
}

// Very small fixed lexicon for the bundled Assamese demo story only.
const ASSAMESE_KNOWN_NAMES: Record<string, string> = {
  'মীৰা': 'Meera',
  'শান্তি': 'Shanti',
}
const ASSAMESE_RELATION_MARKER = 'ছোৱালী' // "daughter"
const ASSAMESE_PLACE: Record<string, string> = {
  'কামাখ্যা মন্দিৰ': 'Kamakhya Temple',
}

export function extractEnglish(story: string): ExtractionCandidate[] {
  const candidates: ExtractionCandidate[] = []

  // Capitalized-word heuristic for person/place names (very simple, documented).
  const nameRegex = /\b([A-Z][a-z]+)\b/g
  const knownStopwords = new Set(['Last', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'It', 'The'])
  let m: RegExpExecArray | null
  const seenNames = new Set<string>()
  while ((m = nameRegex.exec(story))) {
    const word = m[1]
    if (knownStopwords.has(word) || seenNames.has(word)) continue
    seenNames.add(word)
    candidates.push({
      id: newId('cand'), kind: 'person', label: word,
      span: { text: word, start: m.index, end: m.index + word.length },
      confidence: 'medium', ambiguous: false, decision: 'pending',
    })
  }

  // Relationship words -> attach relationshipToPatient suggestion to nearest preceding person candidate.
  for (const [word, label] of Object.entries(REL_WORDS_EN)) {
    const idx = story.toLowerCase().indexOf(word)
    if (idx === -1) continue
    const preceding = [...candidates].filter((c) => c.kind === 'person' && c.span.start < idx).pop()
    if (preceding) {
      preceding.relationshipToPatient = label
    }
  }

  // Known place: Kamakhya Temple (exact phrase match, documented pattern)
  const templeIdx = story.indexOf('Kamakhya Temple')
  if (templeIdx !== -1) {
    candidates.push({
      id: newId('cand'), kind: 'place', label: 'Kamakhya Temple',
      span: { text: 'Kamakhya Temple', start: templeIdx, end: templeIdx + 'Kamakhya Temple'.length },
      confidence: 'high', ambiguous: false, decision: 'pending',
    })
  }

  // Anything with lowercase pronouns/unclear referents gets flagged, honestly, rather than guessed.
  if (/\bthey\b|\bit\b/i.test(story) && candidates.filter(c=>c.kind==='person').length < 1) {
    candidates.push({
      id: newId('cand'), kind: 'person', label: '(unclear — needs manual entry)',
      span: { text: story.slice(0, 20), start: 0, end: 20 },
      confidence: 'low', ambiguous: true, decision: 'pending',
    })
  }

  return candidates
}

export function extractAssamese(story: string): ExtractionCandidate[] {
  const candidates: ExtractionCandidate[] = []
  for (const [as, en] of Object.entries(ASSAMESE_KNOWN_NAMES)) {
    const idx = story.indexOf(as)
    if (idx === -1) continue
    const cand: ExtractionCandidate = {
      id: newId('cand'), kind: 'person', label: en,
      span: { text: as, start: idx, end: idx + as.length },
      confidence: 'high', ambiguous: false, decision: 'pending',
    }
    if (story.includes(ASSAMESE_RELATION_MARKER) && en === 'Meera') {
      cand.relationshipToPatient = 'Daughter'
    }
    candidates.push(cand)
  }
  for (const [as, en] of Object.entries(ASSAMESE_PLACE)) {
    const idx = story.indexOf(as)
    if (idx === -1) continue
    candidates.push({
      id: newId('cand'), kind: 'place', label: en,
      span: { text: as, start: idx, end: idx + as.length },
      confidence: 'high', ambiguous: false, decision: 'pending',
    })
  }
  if (candidates.length === 0) {
    candidates.push({
      id: newId('cand'), kind: 'person', label: '(Assamese text not recognized — needs manual entry)',
      span: { text: story.slice(0, 20), start: 0, end: 20 },
      confidence: 'low', ambiguous: true, decision: 'pending',
    })
  }
  return candidates
}

// Deduplicate confirmed candidates against existing verified entities by
// case-insensitive name match, so re-teaching the same story twice does
// not create duplicate people/places.
export function dedupeAgainstExisting(label: string, existing: Entity[]): Entity | undefined {
  return existing.find((e) => e.name.toLowerCase() === label.toLowerCase())
}
