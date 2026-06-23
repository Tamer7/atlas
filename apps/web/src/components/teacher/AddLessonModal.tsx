'use client'

import { useState } from 'react'
import { Field } from '@/components/ui'
import { useCreateLesson } from '@/hooks/curriculum/useLesson'
import type { Module } from '@/types/curriculum'

interface AddLessonModalProps {
  courseId: string
  modules: Module[]
  onClose: () => void
}

export function AddLessonModal({ courseId, modules, onClose }: AddLessonModalProps) {
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const create = useCreateLesson(moduleId, courseId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleId) return
    await create.mutateAsync({ title, content_type: 'text' })
    onClose()
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label="Add lesson"
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
      />
      <form
        onSubmit={handleSubmit}
        className="card card-pad-lg"
        style={{ position: 'relative', width: 480, zIndex: 1 }}
      >
        <h2 className="h2" style={{ marginBottom: 20 }}>Add lesson</h2>

        {modules.length === 0 ? (
          <p className="muted" style={{ fontSize: 14 }}>
            Add a module first before creating lessons.
          </p>
        ) : (
          <>
            <Field label="Module">
              <select
                className="select"
                value={moduleId}
                onChange={e => setModuleId(e.target.value)}
              >
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </Field>

            <Field label="Title">
              <input
                className="input"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Introduction to mixed conditionals"
              />
            </Field>
          </>
        )}

        {create.isError && (
          <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }}>
            Could not create lesson. Please try again.
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            className="btn btn-brand"
            disabled={create.isPending || modules.length === 0}
          >
            {create.isPending ? 'Adding…' : 'Add lesson'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
