// Activity logging + derived interaction categories.
// Categories are explicitly application interaction labels, not a
// medical/clinical assessment (see ARCHITECTURE.md and every screen
// that surfaces them).
import type { GameEvent, InteractionCategory, RescueLog } from './types'

export function categorize(rescueLog: RescueLog[], correct: boolean, revealed: boolean): InteractionCategory {
  if (revealed && !correct) return 'revealed_no_recall'
  const delivered = rescueLog.filter((r) => r.outcome === 'delivered').map((r) => r.level)
  if (delivered.length === 0) return 'independent_recall'
  const maxLevel = Math.max(...delivered)
  if (maxLevel <= 2) return 'light_cue'
  return 'multiple_cues'
}

export function buildEventId(sessionId: string, gameId: string, entityId: string | undefined, attemptSeq: number): string {
  // Deterministic id -> retries with the same inputs won't double-count.
  return `evt_${sessionId}_${gameId}_${entityId ?? 'na'}_${attemptSeq}`
}

export function summarizeRange(events: GameEvent[], sinceDays: number) {
  const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000
  const inRange = events.filter((e) => new Date(e.startedAt).getTime() >= cutoff)
  const completed = inRange.filter((e) => e.outcome === 'completed')
  const byCategory: Record<InteractionCategory, number> = {
    independent_recall: 0, light_cue: 0, multiple_cues: 0, revealed_no_recall: 0,
  }
  for (const e of inRange) {
    if (e.category) byCategory[e.category]++
  }
  const byGame: Record<string, number> = {}
  for (const e of inRange) byGame[e.gameId] = (byGame[e.gameId] ?? 0) + 1
  return { totalEvents: inRange.length, completed: completed.length, abandoned: inRange.length - completed.length, byCategory, byGame, events: inRange }
}
