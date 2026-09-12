import { useState } from 'react'
import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'
import { db, newId } from '../lib/db'
import type { Reminder, Role } from '../lib/types'

export function Reminders({ dict, data, patientId, role, reload }: { dict: Dict; data: AppData; patientId: string; role: Role; reload: () => void }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const todayIdx = new Date().getDay()
  const todayIso = new Date().toISOString().slice(0, 10)
  const today = data.reminders.filter((r) => r.daysOfWeek.includes(todayIdx))

  async function add() {
    if (!title.trim()) return
    const r: Reminder = {
      id: newId('rem'), patientId, title, time, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      daysOfWeek: [0,1,2,3,4,5,6], completedDates: [], createdAt: new Date().toISOString(),
    }
    await db.reminders.put(r)
    setTitle('')
    reload()
  }

  async function markDone(r: Reminder) {
    await db.reminders.put({ ...r, completedDates: [...r.completedDates, todayIso] })
    reload()
  }

  async function remove(id: string) {
    await db.reminders.remove(id)
    reload()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{dict.reminders.title}</h2>
      <p className="text-xs text-ink/60">{dict.reminders.offlineNote}</p>

      <div className="card">
        <h3 className="font-semibold mb-2">{dict.reminders.today}</h3>
        {today.length === 0 && <p className="text-ink/60">{dict.reminders.noneToday}</p>}
        <ul className="space-y-2">
          {today.map((r) => {
            const done = r.completedDates.includes(todayIso)
            return (
              <li key={r.id} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2">
                <div>
                  <p className={`font-medium ${done ? 'line-through text-ink/40' : ''}`}>{r.time} — {r.title}</p>
                </div>
                {!done && <button className="btn-secondary text-sm" onClick={() => markDone(r)}>{dict.reminders.markDone}</button>}
              </li>
            )
          })}
        </ul>
      </div>

      {role === 'caregiver' && (
        <div className="card">
          <h3 className="font-semibold mb-2">{dict.reminders.addReminder}</h3>
          <div className="flex gap-2 flex-wrap items-end">
            <div>
              <label className="text-sm block">Title</label>
              <input className="border rounded-lg px-2 py-1 focus-ring" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm block">Time</label>
              <input type="time" className="border rounded-lg px-2 py-1 focus-ring" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={add}>{dict.common.save}</button>
          </div>

          <ul className="mt-4 space-y-2">
            {data.reminders.map((r) => (
              <li key={r.id} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2">
                <span>{r.time} — {r.title}</span>
                <button className="btn-danger text-sm" onClick={() => remove(r.id)}>{dict.common.delete}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
