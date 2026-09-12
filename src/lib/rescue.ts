// Five-level Memory Rescue. Order is fixed and must not be reordered:
// 1 context clue, 2 relationship hint, 3 related memory/photo,
// 4 familiar recorded voice, 5 gentle reveal.
import type { Entity, Capsule, Relationship } from './types'

export interface RescueLevelContent {
  level: 1 | 2 | 3 | 4 | 5
  title: string
  available: boolean
  render: 'text' | 'photo' | 'audio' | 'reveal'
  text?: string
  photoUrl?: string
  audioUrl?: string
  audioLabel?: string
}

export function buildRescueLevels(
  entity: Entity,
  capsules: Capsule[],
  relationships: Relationship[],
  entities: Entity[],
): RescueLevelContent[] {
  const relatedCapsule = capsules.find((c) => c.entityIds.includes(entity.id) && c.status === 'verified' && c.title !== `${entity.name} portrait`)
  const relKind = relationships.find((r) => r.fromEntityId === entity.id || r.toEntityId === entity.id)
  const relatedOther = relKind
    ? entities.find((e) => e.id === (relKind.fromEntityId === entity.id ? relKind.toEntityId : relKind.fromEntityId))
    : undefined

  return [
    {
      level: 1, title: 'Context clue', render: 'text', available: true,
      text: entity.type === 'person'
        ? `This person is connected to memories about ${relatedOther?.name ?? 'your family'}.`
        : `This place appears in a memory from your family's past.`,
    },
    {
      level: 2, title: 'Relationship hint', render: 'text', available: !!entity.relationshipToPatient,
      text: entity.relationshipToPatient ? `Their relationship to you: ${entity.relationshipToPatient}.` : undefined,
    },
    {
      level: 3, title: 'Related memory', render: 'photo', available: !!relatedCapsule?.photoDataUrl,
      photoUrl: relatedCapsule?.photoDataUrl, text: relatedCapsule?.title,
    },
    {
      level: 4, title: 'Familiar voice', render: 'audio', available: !!relatedCapsule?.audioDataUrl,
      audioUrl: relatedCapsule?.audioDataUrl, audioLabel: relatedCapsule?.audioLabel,
    },
    {
      level: 5, title: 'Gentle reveal', render: 'reveal', available: true,
      text: entity.name,
    },
  ]
}
