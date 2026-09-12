import { useRef, useState } from 'react'
import type { Dict } from '../i18n/en'
import type { AppData } from '../hooks/useAppData'
import { db, newId } from '../lib/db'
import type { Capsule, Role } from '../lib/types'

export function Capsules({ dict, data, patientId, role, reload }: { dict: Dict; data: AppData; patientId: string; role: Role; reload: () => void }) {
  const [editing, setEditing] = useState<Capsule | null>(null)
  const [creating, setCreating] = useState(false)

  if (role !== 'caregiver') {
    const verified = data.capsules.filter((c) => c.status === 'verified')
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{dict.capsules.title}</h2>
        {verified.length === 0 && <p className="text-ink/60">{dict.common.empty}</p>}
        {verified.map((c) => <CapsuleCard key={c.id} c={c} dict={dict} />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{dict.capsules.title}</h2>
        <button className="btn-primary" onClick={() => setCreating(true)}>{dict.capsules.newCapsule}</button>
      </div>

      {(creating || editing) && (
        <CapsuleForm
          dict={dict} patientId={patientId} initial={editing ?? undefined}
          onDone={async () => { setCreating(false); setEditing(null); reload() }}
          onCancel={() => { setCreating(false); setEditing(null) }}
        />
      )}

      <div className="space-y-3">
        {data.capsules.length === 0 && <p className="text-ink/60">{dict.common.empty}</p>}
        {data.capsules.map((c) => (
          <div key={c.id} className="card">
            <CapsuleCard c={c} dict={dict} />
            <div className="flex gap-2 mt-3 flex-wrap">
              <button className="btn-secondary text-sm" onClick={() => setEditing(c)}>{dict.common.edit}</button>
              {c.status !== 'verified' && (
                <button className="btn-primary text-sm" onClick={async () => {
                  await db.capsules.put({ ...c, status: 'verified', reviewer: 'Caregiver (demo)', reviewedAt: new Date().toISOString() })
                  reload()
                }}>{dict.common.verify}</button>
              )}
              {c.status !== 'archived' && (
                <button className="btn-secondary text-sm" onClick={async () => {
                  await db.capsules.put({ ...c, status: 'archived' })
                  reload()
                }}>{dict.common.archive}</button>
              )}
              <button className="btn-danger text-sm" onClick={async () => {
                await db.capsules.remove(c.id)
                reload()
              }}>{dict.common.delete}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CapsuleCard({ c, dict }: { c: Capsule; dict: Dict }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{c.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'verified' ? 'bg-sage/30 text-sageDark' : 'bg-yellow-100 text-yellow-800'}`}>
          {c.status === 'verified' ? dict.capsules.verifiedNotice : c.status === 'draft' ? dict.capsules.unverifiedNotice : 'Archived'}
        </span>
      </div>
      {c.photoDataUrl && <img src={c.photoDataUrl} alt={c.title} className="rounded-lg my-2 max-h-40" />}
      <p className="text-sm text-ink/80">{c.story}</p>
      {c.audioDataUrl && (
        <div className="mt-2">
          <audio controls src={c.audioDataUrl} />
          <p className="text-xs text-ink/60">{c.audioLabel}</p>
        </div>
      )}
      {c.reviewer && <p className="text-xs text-ink/50 mt-1">Reviewed by {c.reviewer} · {c.reviewedAt ? new Date(c.reviewedAt).toLocaleString() : ''}</p>}
    </div>
  )
}

function CapsuleForm({
  dict, patientId, initial, onDone, onCancel,
}: {
  dict: Dict; patientId: string; initial?: Capsule
  onDone: () => void; onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [story, setStory] = useState(initial?.story ?? '')
  const [photoDataUrl, setPhotoDataUrl] = useState(initial?.photoDataUrl)
  const [audioDataUrl, setAudioDataUrl] = useState(initial?.audioDataUrl)
  const [audioLabel, setAudioLabel] = useState(initial?.audioLabel)
  const [micError, setMicError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  function onPhotoFile(f: File) {
    const reader = new FileReader()
    reader.onload = () => setPhotoDataUrl(reader.result as string)
    reader.readAsDataURL(f)
  }

  function onAudioFile(f: File) {
    const reader = new FileReader()
    reader.onload = () => { setAudioDataUrl(reader.result as string); setAudioLabel('Uploaded audio file') }
    reader.readAsDataURL(f)
  }

  async function startRecording() {
    setMicError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone recording is not supported in this browser. Use the file upload fallback.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeCandidates = ['audio/webm', 'audio/ogg', 'audio/mp4']
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported?.(m)) ?? ''
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => { setAudioDataUrl(reader.result as string); setAudioLabel('Microphone recording') }
        reader.readAsDataURL(blob)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      mediaRecRef.current = rec
      rec.start()
      setRecording(true)
    } catch (err) {
      setMicError(dict.capsules.micPermissionDenied)
    }
  }

  function stopRecording() {
    mediaRecRef.current?.stop()
    setRecording(false)
  }

  async function save() {
    const now = new Date().toISOString()
    const capsule: Capsule = {
      id: initial?.id ?? newId('cap'),
      patientId,
      title: title || 'Untitled memory',
      story,
      photoDataUrl,
      audioDataUrl,
      audioLabel,
      entityIds: initial?.entityIds ?? [],
      status: initial?.status ?? 'draft',
      reviewer: initial?.reviewer,
      reviewedAt: initial?.reviewedAt,
      createdAt: initial?.createdAt ?? now,
    }
    await db.capsules.put(capsule)
    onDone()
  }

  return (
    <div className="card space-y-3">
      <div>
        <label className="text-sm font-medium block mb-1">Title</label>
        <input className="w-full border rounded-lg px-3 py-2 focus-ring" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">{dict.capsules.storyLabel}</label>
        <textarea className="w-full border rounded-lg px-3 py-2 focus-ring" rows={3} value={story} onChange={(e) => setStory(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">{dict.capsules.photoLabel}</label>
        <input type="file" accept="image/*" className="focus-ring" onChange={(e) => e.target.files?.[0] && onPhotoFile(e.target.files[0])} />
        {photoDataUrl && <img src={photoDataUrl} alt="preview" className="mt-2 max-h-32 rounded-lg" />}
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">{dict.capsules.audioLabel}</label>
        <div className="flex items-center gap-2 flex-wrap">
          {!recording ? (
            <button type="button" className="btn-secondary text-sm" onClick={startRecording}>🎙 Record</button>
          ) : (
            <button type="button" className="btn-danger text-sm" onClick={stopRecording}>⏹ Stop</button>
          )}
          <span className="text-ink/50 text-sm">or</span>
          <label className="btn-secondary text-sm cursor-pointer">
            {dict.capsules.uploadAudioFallback}
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && onAudioFile(e.target.files[0])} />
          </label>
        </div>
        {micError && <p className="text-sm text-[#B5533C] mt-1">{micError}</p>}
        {audioDataUrl && (
          <div className="mt-2">
            <audio controls src={audioDataUrl} />
            <p className="text-xs text-ink/60">{audioLabel}</p>
            <button type="button" className="text-xs underline text-ink/60 mt-1" onClick={() => { setAudioDataUrl(undefined); setAudioLabel(undefined) }}>Remove recording</button>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={save}>{dict.common.save}</button>
        <button className="btn-secondary" onClick={onCancel}>{dict.common.cancel}</button>
      </div>
    </div>
  )
}
