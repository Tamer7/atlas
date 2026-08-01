'use client'

import { useState } from 'react'
import { Field } from '@/components/ui'
import { useCreateModule } from '@/hooks/curriculum/useModules'

interface AddModuleModalProps {
  courseId: string
  onClose: () => void
}

export function AddModuleModal({ courseId, onClose }: AddModuleModalProps) {
  const [title, setTitle] = useState('')
  const create = useCreateModule(courseId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({ title })
    onClose()
  }

  return (
    <dialog
      open
      aria-modal="true"
      aria-label="Add module"
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
        style={{ position: 'relative', width: 480, maxWidth: 'calc(100vw - 32px)', zIndex: 1 }}
      >
        <h2 className="h2" style={{ marginBottom: 20 }}>Add module</h2>

        <Field label="Title">
          <input
            className="input"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Module 1 — Foundations"
          />
        </Field>

        {create.isError && (
          <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }}>
            Could not create module. Please try again.
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-brand" disabled={create.isPending}>
            {create.isPending ? 'Adding…' : 'Add module'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
