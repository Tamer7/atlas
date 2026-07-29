'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Field } from '@/components/ui'
import {
  useCourseSchedule,
  useCreateScheduleSlot,
  useUpdateScheduleSlot,
  useDeleteScheduleSlot,
} from '@/hooks/schedule/useSchedule'
import { DAY_NAMES, dayName } from '@/types/schedule'
import type { ScheduleSlot } from '@/types/schedule'

interface ScheduleManagerModalProps {
  courseId: string
  onClose: () => void
}

const EMPTY_FORM = { day_of_week: 1, start_time: '09:00', end_time: '10:00', label: '' }

export function ScheduleManagerModal({ courseId, onClose }: ScheduleManagerModalProps) {
  const { data: slots = [] } = useCourseSchedule(courseId)
  const createSlot = useCreateScheduleSlot()
  const updateSlot = useUpdateScheduleSlot()
  const deleteSlot = useDeleteScheduleSlot()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const busy = createSlot.isPending || updateSlot.isPending || deleteSlot.isPending

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
        await createSlot.mutateAsync({ courseId, payload })
      }
      resetForm()
    } catch {
      setError('Could not save the schedule slot. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (editingId === id) resetForm()
    await deleteSlot.mutateAsync(id)
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label="Course schedule"
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
      <div
        className="card card-pad-lg"
        style={{ position: 'relative', width: 560, zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 className="h2" style={{ marginBottom: 6 }}>Weekly schedule</h2>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
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
            <div className="help" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div>
          )}

          <div className="row" style={{ marginTop: 16, gap: 10, justifyContent: 'flex-end' }}>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={busy}>
                Cancel edit
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Done
            </button>
            <button type="submit" className="btn btn-brand" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Save slot' : 'Add slot'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
