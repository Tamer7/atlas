'use client'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Calendar, X } from '@/components/ui'
import { Field } from '@/components/ui'
import { useCourses } from '@/hooks/courses/useCourses'
import { createLiveClass } from '@/lib/api/live'
import { liveKeys } from '@/hooks/live/useLiveClasses'

export function ScheduleModal({ onClose }: { onClose: () => void }) {
  const { data: courses = [] } = useCourses()
  const qc = useQueryClient()

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [date, setDate] = useState(tomorrow)
  const [time, setTime] = useState('10:00')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!courseId) { setError('Please select a course.'); return }
    if (!date || !time) { setError('Please pick a date and time.'); return }

    setSaving(true)
    setError('')
    try {
      await createLiveClass({
        course_id: courseId,
        title: title.trim(),
        scheduled_at: `${date}T${time}:00`,
      })
      await qc.invalidateQueries({ queryKey: liveKeys.teacher })
      onClose()
    } catch {
      setError('Could not schedule the class. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 'min(520px, 96vw)', maxHeight: '90vh', overflow: 'auto', padding: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="between" style={{ marginBottom: 20 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>New session</div>
            <h2 className="h3">Schedule a live class</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="col" style={{ gap: 16 }}>
          <Field label="Class title">
            <input className="input" placeholder="e.g. Q&A session — Unit 3" value={title} onChange={e => setTitle(e.target.value)} />
          </Field>

          <Field label="Course">
            <select className="select" value={courseId} onChange={e => setCourseId(e.target.value)}>
              <option value="">Select a course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>

          <div className="g g-sm g-2">
            <Field label="Date"><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
            <Field label="Time"><input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} /></Field>
          </div>

          {error && <div style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</div>}

          <div className="row" style={{ gap: 10, marginTop: 4 }}>
            <button className="btn btn-secondary btn-block" onClick={onClose}>Cancel</button>
            <button className="btn btn-brand btn-block" onClick={handleSubmit} disabled={saving}>
              <Calendar size={14} /> {saving ? 'Scheduling…' : 'Schedule class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
