import { useCallback, useEffect, useState } from 'react'
import { db } from '../lib/db'
import { buildSeed, PATIENT_ID } from '../lib/seed'
import type { Patient, Entity, Relationship, Capsule, GameEvent, Reminder, Role } from '../lib/types'
import type { Lang } from '../i18n'

export interface AppData {
  patients: Patient[]
  entities: Entity[]
  relationships: Relationship[]
  capsules: Capsule[]
  gameEvents: GameEvent[]
  reminders: Reminder[]
}

const emptyData: AppData = { patients: [], entities: [], relationships: [], capsules: [], gameEvents: [], reminders: [] }

export function useAppData() {
  const [data, setData] = useState<AppData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<Role>('caregiver')
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('yaadri_lang') as Lang) || 'en')

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [patients, entities, relationships, capsules, gameEvents, reminders] = await Promise.all([
        db.patients.all(), db.entities.all(), db.relationships.all(), db.capsules.all(), db.gameEvents.all(), db.reminders.all(),
      ])
      if (patients.length === 0) {
        const seed = buildSeed()
        await Promise.all(seed.patients.map((p) => db.patients.put(p)))
        await Promise.all(seed.entities.map((e) => db.entities.put(e)))
        await Promise.all(seed.relationships.map((r) => db.relationships.put(r)))
        await Promise.all(seed.capsules.map((c) => db.capsules.put(c)))
        await Promise.all(seed.reminders.map((r) => db.reminders.put(r)))
        await Promise.all(seed.gameEvents.map((g) => db.gameEvents.put(g)))
        setData(seed)
      } else {
        setData({ patients, entities, relationships, capsules, gameEvents, reminders })
      }
    } catch (e) {
      setError((e as Error).message ?? 'Failed to load local demo data (IndexedDB unavailable).')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => { localStorage.setItem('yaadri_lang', lang) }, [lang])

  const resetDemo = useCallback(async () => {
    await db.resetAllLocalDemoData()
    await reload()
  }, [reload])

  return { data, loading, error, reload, resetDemo, role, setRole, lang, setLang, patientId: PATIENT_ID }
}
