'use client'
import { useState } from 'react'
import { Field } from '@/components/ui'
import { useCreateAdminUser } from '@/hooks/admin/useAdminUsers'
import type { AdminRole, CreateAdminUserPayload } from '@/types/admin'

const ROLES: AdminRole[] = ['student', 'teacher', 'admin']

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'invite' | 'password'>('invite')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRole>('teacher')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const create = useCreateAdminUser()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const payload: CreateAdminUserPayload =
      mode === 'invite'
        ? { mode, email, role }
        : { mode, name, email, role, password }

    try {
      await create.mutateAsync(payload)
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'Could not create the user.')
    }
  }

  // Shell (dialog + overlay button + card form) mirrors
  // components/teacher/InviteStudentModal.tsx so both modals behave identically.
  return (
    <dialog
      open
      aria-modal="true"
      aria-label="Add a user"
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
        onSubmit={submit}
        className="card card-pad-lg"
        style={{ position: 'relative', width: 480, zIndex: 1 }}
      >
        <h2 className="h2" style={{ marginBottom: 20 }}>Add a user</h2>

        <div className="row" style={{ gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            className={mode === 'invite' ? 'btn btn-brand' : 'btn btn-secondary'}
            onClick={() => setMode('invite')}
          >
            Send invitation
          </button>
          <button
            type="button"
            className={mode === 'password' ? 'btn btn-brand' : 'btn btn-secondary'}
            onClick={() => setMode('password')}
          >
            Set a password
          </button>
        </div>

        {mode === 'password' && (
          <Field label="Full name">
            <input
              className="input"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
            />
          </Field>
        )}

        <Field label="Email address">
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="teacher@example.com"
          />
        </Field>

        <Field label="Role">
          <select
            className="input"
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        {mode === 'password' && (
          <Field label="Password">
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Field>
        )}

        {error && (
          <div className="help" style={{ color: 'var(--danger)', marginTop: 12 }} role="alert">
            {error}
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-brand" disabled={create.isPending}>
            {create.isPending ? 'Saving…' : mode === 'invite' ? 'Send invitation' : 'Create user'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
