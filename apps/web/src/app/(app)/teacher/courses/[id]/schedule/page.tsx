'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Field } from '@/components/ui'
import { useCourse } from '@/hooks/courses/useCourses'
import {
  useCourseSchedule,
  useCreateScheduleSlot,
  useUpdateScheduleSlot,
  useDeleteScheduleSlot,
} from '@/hooks/schedule/useSchedule'
import { DAY_NAMES, dayName } from '@/types/schedule'
import type { ScheduleSlot } from '@/types/schedule'

const EMPTY_FORM = { day_of_week: 1, start_time: '09:00', end_time: '10:00', label: '' }

export default function ScheduleManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: course } = useCourse(id)
  const { data: slots = [] } = useCourseSchedule(id)
  const createSlot = useCreateScheduleSlot()
  const updateSlot = useUpdateScheduleSlot()
  const deleteSlot = useDeleteScheduleSlot()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const busy = createSlot.isPending || updateSlot.isPending || deleteSlot.isPending

  const goToCourse = () => router.push(`/courses/${id}`)

  const startEdit = (slot: ScheduleSlot) => {
    setEditingId(slot.id)
    setForm({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      label: slot.label ?? '',
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.end_time <= form.start_time) {
      setError('End time must be after start time.')
      return
    }

    const payload = {
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      label: form.label.trim() || undefined,
    }

    try {
      if (editingId) {
        await updateSlot.mutateAsync({ id: editingId, payload })
      } else {
        await createSlot.mutateAsync({ courseId: id, payload })
      }
      resetForm()
    } catch {
      setError('Could not save the schedule slot. Please try again.')
    }
  }

  const handleDelete = async (slotId: string) => {
    if (editingId === slotId) resetForm()
    await deleteSlot.mutateAsync(slotId)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                goToCourse()
              }}
            >
              {course?.title ?? 'Course'}
            </a>
            {' / Schedule'}
          </div>
          <h1 className="h1">Weekly schedule</h1>
        </div>
      </div>

      <div className="card card-pad-lg" style={{ maxWidth: 760 }}>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
          Students enrolled in this course see these times. Edit or remove slots any time —
          changes are visible to students immediately.
        </p>

        {slots.length === 0 ? (
          <div className="card card-pad muted" style={{ fontSize: 13, marginBottom: 20 }}>
            No schedule yet. Add the first weekly slot below.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {slots.map(slot => (
              <div
                key={slot.id}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: editingId === slot.id ? 'var(--brand-tint)' : undefined,
                }}
              >
                <div style={{ minWidth: 90, fontWeight: 600, fontSize: 13 }}>
                  {dayName(slot.day_of_week)}
                </div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  {slot.start_time}–{slot.end_time}
                </div>
                <div className="muted" style={{ flex: 1, fontSize: 13 }}>{slot.label}</div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  title="Edit slot"
                  onClick={() => startEdit(slot)}
                  disabled={busy}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  title="Delete slot"
                  onClick={() => handleDelete(slot.id)}
                  disabled={busy}
                >
                  <Trash2 size={13} color="var(--danger)" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            {editingId ? 'Edit slot' : 'Add slot'}
          </div>
          <div className="g g-sm g-3">
            <Field label="Day">
              <select
                className="select"
                value={form.day_of_week}
                onChange={e => setForm(f => ({ ...f, day_of_week: Number(e.target.value) }))}
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
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
              />
            </Field>
            <Field label="Ends">
              <input
                className="input"
                type="time"
                required
                value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Label (optional)">
            <input
              className="input"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Room 204 · Grammar session"
              maxLength={120}
            />
          </Field>

          {error && (
            <div className="help" style={{ color: 'var(--danger)', marginTop: 8 }} role="alert">{error}</div>
          )}

          <div className="row" style={{ marginTop: 16, gap: 10, justifyContent: 'flex-end' }}>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={busy}>
                Cancel edit
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={goToCourse} disabled={busy}>
              Done
            </button>
            <button type="submit" className="btn btn-brand" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Save slot' : 'Add slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
