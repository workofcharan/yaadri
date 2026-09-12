// Minimal, dependency-free IndexedDB wrapper for Local Demo mode.
// Local Demo mode is explicitly a "Fictional local demo": data is
// durable per-browser (IndexedDB), no Supabase/AI credentials are
// required, and a reset action is available (resetToSeed) that is
// gated to this mode only. Role switching here is a UI convenience,
// NOT authentication — see ARCHITECTURE.md.

import type {
  Patient, Entity, Relationship, Capsule, GameEvent, Reminder,
} from './types'

const DB_NAME = 'yaadri-local-demo'
const DB_VERSION = 1

const STORES = ['patients', 'entities', 'relationships', 'capsules', 'gameEvents', 'reminders'] as const
type StoreName = typeof STORES[number]

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode)
    const s = t.objectStore(store)
    const req = fn(s)
    t.oncomplete = () => resolve((req as IDBRequest<T>)?.result as T)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  })
}

async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, 'readonly')
    const req = t.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

async function put<T extends { id: string }>(store: StoreName, value: T): Promise<T> {
  await tx(store, 'readwrite', (s) => s.put(value))
  return value
}

async function remove(store: StoreName, id: string): Promise<void> {
  await tx(store, 'readwrite', (s) => s.delete(id))
}

async function clearStore(store: StoreName): Promise<void> {
  await tx(store, 'readwrite', (s) => s.clear())
}

export const db = {
  patients: {
    all: () => getAll<Patient>('patients'),
    put: (p: Patient) => put('patients', p),
  },
  entities: {
    all: () => getAll<Entity>('entities'),
    put: (e: Entity) => put('entities', e),
    remove: (id: string) => remove('entities', id),
  },
  relationships: {
    all: () => getAll<Relationship>('relationships'),
    put: (r: Relationship) => put('relationships', r),
    remove: (id: string) => remove('relationships', id),
  },
  capsules: {
    all: () => getAll<Capsule>('capsules'),
    put: (c: Capsule) => put('capsules', c),
    remove: (id: string) => remove('capsules', id),
  },
  gameEvents: {
    all: () => getAll<GameEvent>('gameEvents'),
    put: (g: GameEvent) => put('gameEvents', g),
  },
  reminders: {
    all: () => getAll<Reminder>('reminders'),
    put: (r: Reminder) => put('reminders', r),
    remove: (id: string) => remove('reminders', id),
  },
  async resetAllLocalDemoData() {
    for (const s of STORES) await clearStore(s)
  },
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
