// Fictional demo dataset. Clearly synthetic — see DEMO_SCRIPT.md.
// All names, dates and events are invented. Demo data never leaks into
// a "real" patient because Local Demo mode is the only mode this
// prototype runs (Connected mode is documented, not implemented here).
import { newId } from './db'
import { demoAudioDataUrl } from '../assets/demoAudioBase64'
import type { Patient, Entity, Relationship, Capsule, Reminder, GameEvent } from './types'

export const PATIENT_ID = 'patient_shanti_demo'

export function buildSeed(): {
  patients: Patient[]
  entities: Entity[]
  relationships: Relationship[]
  capsules: Capsule[]
  reminders: Reminder[]
  gameEvents: GameEvent[]
} {
  const now = new Date().toISOString()

  const patients: Patient[] = [
    { id: PATIENT_ID, name: 'Shanti Sharma', age: 72, location: 'Guwahati, Assam', createdAt: now },
  ]

  const eMeera: Entity = { id: 'ent_meera', patientId: PATIENT_ID, type: 'person', name: 'Meera', relationshipToPatient: 'Daughter', verified: true, createdAt: now }
  const eRahul: Entity = { id: 'ent_rahul', patientId: PATIENT_ID, type: 'person', name: 'Rahul', relationshipToPatient: 'Son', verified: true, createdAt: now }
  const eHome: Entity = { id: 'ent_home', patientId: PATIENT_ID, type: 'place', name: 'Family home, Guwahati', verified: true, createdAt: now }
  const eTemple: Entity = { id: 'ent_temple', patientId: PATIENT_ID, type: 'place', name: 'Kamakhya Temple', verified: true, createdAt: now }
  const eBirthday: Entity = { id: 'ent_birthday', patientId: PATIENT_ID, type: 'event', name: '65th Birthday Visit', verified: true, createdAt: now }
  const eTempleVisit: Entity = { id: 'ent_temple_visit', patientId: PATIENT_ID, type: 'event', name: 'Kamakhya Temple Visit', verified: true, createdAt: now }

  const entities = [eMeera, eRahul, eHome, eTemple, eBirthday, eTempleVisit]

  const relationships: Relationship[] = [
    { id: newId('rel'), patientId: PATIENT_ID, fromEntityId: eMeera.id, toEntityId: eBirthday.id, kind: 'PARTICIPANT_OF', verified: true, createdAt: now },
    { id: newId('rel'), patientId: PATIENT_ID, fromEntityId: eRahul.id, toEntityId: eBirthday.id, kind: 'PARTICIPANT_OF', verified: true, createdAt: now },
    { id: newId('rel'), patientId: PATIENT_ID, fromEntityId: eBirthday.id, toEntityId: eHome.id, kind: 'OCCURRED_AT', verified: true, createdAt: now },
    { id: newId('rel'), patientId: PATIENT_ID, fromEntityId: eTempleVisit.id, toEntityId: eTemple.id, kind: 'OCCURRED_AT', verified: true, createdAt: now },
    { id: newId('rel'), patientId: PATIENT_ID, fromEntityId: eMeera.id, toEntityId: eTempleVisit.id, kind: 'PARTICIPANT_OF', verified: true, createdAt: now },
  ]

  const capsules: Capsule[] = [
    {
      id: newId('cap'), patientId: PATIENT_ID, title: 'Our home in Guwahati',
      story: 'This is our family home in Guwahati, where Shanti raised Meera and Rahul.',
      photoDataUrl: '/demo-assets/family-home.svg',
      entityIds: [eHome.id, eMeera.id, eRahul.id], status: 'verified',
      reviewer: 'Meera (caregiver)', reviewedAt: now, createdAt: now,
    },
    {
      id: newId('cap'), patientId: PATIENT_ID, title: 'Visiting Kamakhya Temple',
      story: 'Shanti and Meera visited Kamakhya Temple together on a quiet Sunday morning.',
      photoDataUrl: '/demo-assets/kamakhya-temple.svg',
      audioDataUrl: demoAudioDataUrl, audioLabel: 'Fictional demo recording (synthetic placeholder tone, not a real voice)',
      entityIds: [eTemple.id, eTempleVisit.id, eMeera.id], status: 'verified',
      reviewer: 'Meera (caregiver)', reviewedAt: now, createdAt: now,
    },
    {
      id: newId('cap'), patientId: PATIENT_ID, title: "Shanti's 65th birthday",
      story: 'The whole family gathered at home to celebrate Shanti turning 65, with Meera and Rahul both there.',
      photoDataUrl: '/demo-assets/birthday-65.svg',
      entityIds: [eBirthday.id, eHome.id, eMeera.id, eRahul.id], status: 'verified',
      reviewer: 'Meera (caregiver)', reviewedAt: now, createdAt: now,
    },
    {
      id: newId('cap'), patientId: PATIENT_ID, title: 'Family celebration photo',
      story: 'A cheerful family celebration photo, useful for the memory puzzle activity.',
      photoDataUrl: '/demo-assets/puzzle-family-celebration.svg',
      entityIds: [eHome.id], status: 'verified',
      reviewer: 'Meera (caregiver)', reviewedAt: now, createdAt: now,
    },
  ]

  // Portrait capsules used by Face-Name Recall (need a verified photo per person)
  capsules.push(
    { id: newId('cap'), patientId: PATIENT_ID, title: 'Meera portrait', story: 'A portrait of Meera, illustrative demo photo.', photoDataUrl: '/demo-assets/portrait-meera.svg', entityIds: [eMeera.id], status: 'verified', reviewer: 'Meera (caregiver)', reviewedAt: now, createdAt: now },
    { id: newId('cap'), patientId: PATIENT_ID, title: 'Rahul portrait', story: 'A portrait of Rahul, illustrative demo photo.', photoDataUrl: '/demo-assets/portrait-rahul.svg', entityIds: [eRahul.id], status: 'verified', reviewer: 'Meera (caregiver)', reviewedAt: now, createdAt: now },
  )

  const reminders: Reminder[] = [
    { id: newId('rem'), patientId: PATIENT_ID, title: 'Morning tea with Meera', time: '08:30', timezone: 'Asia/Kolkata', daysOfWeek: [0,1,2,3,4,5,6], completedDates: [], createdAt: now },
    { id: newId('rem'), patientId: PATIENT_ID, title: 'Evening walk', time: '17:30', timezone: 'Asia/Kolkata', daysOfWeek: [1,3,5], completedDates: [], createdAt: now },
  ]

  // Small, transparently-labeled synthetic activity history so the
  // dashboard has something to aggregate on first load.
  const gameEvents: GameEvent[] = [
    { id: 'seed_evt_1', sessionId: 'seed_sess_1', patientId: PATIENT_ID, gameId: 'face-name', entityId: eMeera.id, startedAt: daysAgoIso(2), endedAt: daysAgoIso(2), outcome: 'completed', attempts: 1, rescueLog: [], category: 'independent_recall', correct: true },
    { id: 'seed_evt_2', sessionId: 'seed_sess_2', patientId: PATIENT_ID, gameId: 'face-name', entityId: eRahul.id, startedAt: daysAgoIso(2), endedAt: daysAgoIso(2), outcome: 'completed', attempts: 2, rescueLog: [{ level: 1, outcome: 'delivered' }], category: 'light_cue', correct: true },
    { id: 'seed_evt_3', sessionId: 'seed_sess_3', patientId: PATIENT_ID, gameId: 'connect-memory', startedAt: daysAgoIso(1), endedAt: daysAgoIso(1), outcome: 'completed', attempts: 3, rescueLog: [], category: 'independent_recall', correct: true },
    { id: 'seed_evt_4', sessionId: 'seed_sess_4', patientId: PATIENT_ID, gameId: 'memory-puzzle', startedAt: daysAgoIso(1), endedAt: daysAgoIso(1), outcome: 'completed', attempts: 4, rescueLog: [{ level: 1, outcome: 'delivered' }, { level: 2, outcome: 'delivered' }, { level: 3, outcome: 'delivered' }], category: 'multiple_cues', correct: true, puzzleCompleted: true },
  ]

  return { patients, entities, relationships, capsules, reminders, gameEvents }
}

function daysAgoIso(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// The two demo stories used by "Teach YAADRI About Me" (English + Assamese).
export const DEMO_STORY_EN =
  "Last Sunday, Meera took Shanti to Kamakhya Temple. It was a calm morning and Shanti smiled the whole time. Meera is Shanti's daughter."

export const DEMO_STORY_AS =
  "যোৱা দেওবাৰে মীৰাই শান্তিক কামাখ্যা মন্দিৰলৈ লৈ গৈছিল। মীৰা শান্তিৰ ছোৱালী।"
