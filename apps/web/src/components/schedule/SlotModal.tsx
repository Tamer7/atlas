'use client'

import { useState } from 'react'
import { Field } from '@/components/ui'
import {
  useCreateScheduleSlot,
  useUpdateScheduleSlot,
  useDeleteScheduleSlot,
} from '@/hooks/schedule/useSchedule'
import { DAY_NAMES } from '@/types/schedule'
import type { RangeSelection } from '@/components/schedule/WeeklyCalendar'
import type { ScheduleSlot } from '@/types/schedule'

interface CourseOption {
  id: string
  title: string
}

interface SlotModalProps {
  /** Courses the teacher can schedule; used for the course picker when creating. */
  courses: CourseOption[]
  /** Prefilled from the calendar selection when creating a new slot. */
  initialRange?: RangeSelection | null
  /** When set, the modal edits this slot instead of creating one. */
  slot?: ScheduleSlot | null
  onClose: () => void
}

export function SlotModal({ courses, initialRange, slot, onClose }: SlotModalProps) {
  const isEdit = !!slot

  const [courseId, setCourseId] = useState(slot?.course_id ?? courses[0]?.id ?? '')
  const [dayOfWeek, setDayOfWeek] = useState(slot?.day_of_week ?? initialRange?.day_of_week ?? 1)
  const [startTime, setStartTime] = useState(slot?.start_time ?? initialRange?.start_time ?? '09:00')
  const [endTime, setEndTime] = useState(slot?.end_time ?? initialRange?.end_time ?? '10:00')
  const [label, setLabel] = useState(slot?.label ?? '')
  const [error, setError] = useState('')

  const createSlot = useCreateScheduleSlot()
  const updateSlot = useUpdateScheduleSlot()
  const deleteSlot = useDeleteScheduleSlot()
  const busy = createSlot.isPending || updateSlot.isPending || deleteSlot.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (endTime <= startTime) {
      setError('End time must be after start time.')
      return
    }

    const payload = {
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      label: label.trim() || undefined,
    }

    try {
      if (isEdit && slot) {
        await updateSlot.mutateAsync({ id: slot.id, payload })
      } else {
        await createSlot.mutateAsync({ courseId, payload })
      }
      onClose()
    } catch {
      setError('Could not save the class time. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!slot) return
    try {
      await deleteSlot.mutateAsync(slot.id)
      onClose()
    } catch {
      setError('Could not delete the class time. Please try again.')
    }
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label={isEdit ? 'Edit class time' : 'Add class time'}
      style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        background: 'transparent', display: 'grid', placeItems: 'center',
        zIndex: 50, padding: 0, border: 0, maxWidth: 'none', maxHeight: 'none',
      }}
    >
      <button
        aria-label="Close"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          background: 'var(--overlay)', border: 0, cursor: 'default', padding: 0,
        }}
        onClick={onClose}
        disabled={busy}
      />
      <form
        onSubmit={handleSubmit}
        className="card card-pad-lg"
        style={{ position: 'relative', width: 460, maxWidth: 'calc(100vw - 32px)', maxHeight: '90dvh', overflowY: 'auto', zIndex: 1 }}
      >
        <h2 className="h2" style={{ marginBottom: 20 }}>
          {isEdit ? 'Edit class time' : 'Add class time'}
        </h2>

        {isEdit ? (
          <Field label="Course">
            <div className="input" style={{ display: 'flex', alignItems: 'center', background: 'var(--paper-2)' }}>
              {slot?.course?.title ?? 'Course'}
            </div>
          </Field>
        ) : (
          <Field label="Course">
            <select className="select" value={courseId} onChange={e => setCourseId(e.target.value)}>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </Field>
        )}

        <div className="g g-sm g-3">
          <Field label="Day">
            <select
              className="select"
              value={dayOfWeek}
              onChange={e => setDayOfWeek(Number(e.target.value))}
            >
              {DAY_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>
          </Field>
          <Field label="Starts">
            <input
              className="input"
              type="time"
              required
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </Field>
          <Field label="Ends">
            <input
              className="input"
              type="time"
              required
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Label (optional)">
          <input
            className="input"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Room 204 · Grammar session"
            maxLength={120}
          />
        </Field>

        {error && (
          <div className="help" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10 }}>
          {isEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: 'var(--danger)' }}
              onClick={handleDelete}
              disabled={busy}
            >
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-brand"
            disabled={busy || (!isEdit && courses.length === 0)}
          >
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add class time'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
