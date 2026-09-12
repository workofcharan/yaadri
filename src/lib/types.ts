// Shared domain types for both Local Demo mode (IndexedDB) and the
// documented Connected mode (Supabase) schema in /sql. Keeping one
// typed shape lets game/business logic stay identical across modes,
// per the "shared typed repository interface" requirement.

export type Role = 'caregiver' | 'patient'

export interface Patient {
  id: string
  name: string
  age: number
  location: string
  createdAt: string
}

export type EntityType = 'person' | 'place' | 'event'

export interface Entity {
  id: string
  patientId: string
  type: EntityType
  name: string
  relationshipToPatient?: string // e.g. "Daughter", only for type=person
  verified: boolean
  createdAt: string
  sourceCapsuleId?: string
}

export type RelationKind = 'FAMILY_OF' | 'LOCATED_AT' | 'OCCURRED_AT' | 'PARTICIPANT_OF'

export interface Relationship {
  id: string
  patientId: string
  fromEntityId: string
  toEntityId: string
  kind: RelationKind
  verified: boolean
  createdAt: string
  sourceCapsuleId?: string
}

export interface Capsule {
  id: string
  patientId: string
  title: string
  story: string
  photoDataUrl?: string
  audioDataUrl?: string
  audioLabel?: string // honest label, e.g. "Fictional demo voice recording"
  entityIds: string[] // linked, may include unverified pending review
  status: 'draft' | 'verified' | 'archived'
  reviewer?: string
  reviewedAt?: string
  createdAt: string
}

export interface ExtractionSpan {
  text: string
  start: number
  end: number
}

export type ExtractionKind = 'person' | 'place' | 'event' | 'relationship'

export interface ExtractionCandidate {
  id: string
  kind: ExtractionKind
  label: string
  relationshipToPatient?: string
  relationKind?: RelationKind
  fromLabel?: string
  toLabel?: string
  span: ExtractionSpan
  confidence: 'high' | 'medium' | 'low'
  ambiguous: boolean
  decision: 'pending' | 'confirmed' | 'corrected' | 'rejected'
  correctedLabel?: string
}

export type GameId = 'face-name' | 'connect-memory' | 'memory-puzzle'

export type CueLevel = 1 | 2 | 3 | 4 | 5
export type CueOutcome = 'delivered' | 'unavailable' | 'skipped'

export interface RescueLog {
  level: CueLevel
  outcome: CueOutcome
}

export type InteractionCategory =
  | 'independent_recall'
  | 'light_cue'
  | 'multiple_cues'
  | 'revealed_no_recall'

export interface GameEvent {
  id: string // idempotent event id
  sessionId: string
  patientId: string
  gameId: GameId
  entityId?: string
  startedAt: string
  endedAt?: string
  outcome: 'completed' | 'abandoned'
  attempts: number
  rescueLog: RescueLog[]
  category?: InteractionCategory
  correct: boolean
  puzzleCompleted?: boolean // stored separately from recall-question performance
}

export interface Reminder {
  id: string
  patientId: string
  title: string
  time: string // HH:mm
  timezone: string
  daysOfWeek: number[] // 0=Sun..6=Sat
  completedDates: string[] // ISO date strings
  snoozedUntil?: string
  createdAt: string
}

export interface AppState {
  mode: 'local-demo'
  role: Role
  language: 'en' | 'as'
  activePatientId: string | null
}
