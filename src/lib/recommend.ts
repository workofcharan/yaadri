// Personalized activity selection: simple, deterministic, explainable.
// Never infers clinical difficulty or disease progression.
import type { Entity, Capsule, GameEvent, GameId } from './types'

export interface Recommendation {
  gameId: GameId
  reason: string
  score: number
}

export function recommendActivities(entities: Entity[], capsules: Capsule[], events: GameEvent[]): Recommendation[] {
  const verifiedPeople = entities.filter((e) => e.type === 'person' && e.verified)
  const recs: Recommendation[] = []

  const recentByGame: Record<string, number> = {}
  const lastPlayedByGame: Record<string, number> = {}
  for (const e of events) {
    recentByGame[e.gameId] = (recentByGame[e.gameId] ?? 0) + 1
    const t = new Date(e.startedAt).getTime()
    lastPlayedByGame[e.gameId] = Math.max(lastPlayedByGame[e.gameId] ?? 0, t)
  }

  if (verifiedPeople.length >= 2) {
    const daysSince = lastPlayedByGame['face-name'] ? (Date.now() - lastPlayedByGame['face-name']) / 86400000 : 999
    recs.push({
      gameId: 'face-name',
      score: Math.round(daysSince),
      reason: `${verifiedPeople.length} verified people available; ${lastPlayedByGame['face-name'] ? `last played ${Math.round(daysSince)} day(s) ago` : 'not played yet'}.`,
    })
  }

  const verifiedRelated = capsules.filter((c) => c.status === 'verified').length
  if (verifiedRelated >= 2) {
    const daysSince = lastPlayedByGame['connect-memory'] ? (Date.now() - lastPlayedByGame['connect-memory']) / 86400000 : 999
    recs.push({
      gameId: 'connect-memory',
      score: Math.round(daysSince) - 1,
      reason: `${verifiedRelated} verified memories with links available; ${lastPlayedByGame['connect-memory'] ? `last played ${Math.round(daysSince)} day(s) ago` : 'not played yet'}.`,
    })
  }

  const puzzlePhotos = capsules.filter((c) => c.status === 'verified' && c.photoDataUrl)
  if (puzzlePhotos.length >= 1) {
    const daysSince = lastPlayedByGame['memory-puzzle'] ? (Date.now() - lastPlayedByGame['memory-puzzle']) / 86400000 : 999
    recs.push({
      gameId: 'memory-puzzle',
      score: Math.round(daysSince) - 2,
      reason: `${puzzlePhotos.length} verified photo(s) usable for a puzzle; ${lastPlayedByGame['memory-puzzle'] ? `last played ${Math.round(daysSince)} day(s) ago` : 'not played yet'}.`,
    })
  }

  return recs.sort((a, b) => b.score - a.score)
}
