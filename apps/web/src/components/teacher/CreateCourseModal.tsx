'use client'

import { useState } from 'react'
import { Field } from '@/components/ui'
import { useCreateCourse } from '@/hooks/courses/useCourses'

const CATEGORIES = ['Languages', 'Test Prep', 'Soft Skills']

interface CreateCourseModalProps {
  onClose: () => void
}

export function CreateCourseModal({ onClose }: CreateCourseModalProps) {
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const create = useCreateCourse()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({ title, tag, category })
    onClose()
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label="Create course"
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
        <h2 className="h2" style={{ marginBottom: 20 }}>Create course</h2>

        <Field label="Title">
          <input
            className="input"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="English B2 — Conversational Fluency"
          />
        </Field>

        <Field label="Tag" hint="shown on cards">
          <input
            className="input"
            required
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="English · B2"
          />
        </Field>

        <Field label="Category">
          <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-brand" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create course'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
