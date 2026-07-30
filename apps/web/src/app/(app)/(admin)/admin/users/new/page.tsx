'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Field } from '@/components/ui'
import { useCreateAdminUser } from '@/hooks/admin/useAdminUsers'
import type { AdminRole, CreateAdminUserPayload } from '@/types/admin'

const ROLES: AdminRole[] = ['student', 'teacher', 'admin']

export default function NewAdminUserPage() {
  const router = useRouter()
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
      router.push('/admin/users')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'Could not create the user.')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Administration / Users</div>
          <h1 className="h1">Add a user</h1>
        </div>
      </div>

      <form onSubmit={submit} className="card card-pad-lg" style={{ maxWidth: 560 }}>
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
          <Link href="/admin/users" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-brand" disabled={create.isPending}>
            {create.isPending ? 'Saving…' : mode === 'invite' ? 'Send invitation' : 'Create user'}
          </button>
        </div>
      </form>
    </div>
  )
}
