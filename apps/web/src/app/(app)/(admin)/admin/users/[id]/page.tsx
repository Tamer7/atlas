'use client'
import { use, useState } from 'react'
import { Badge } from '@/components/ui'
import {
  useAdminUser,
  useSendPasswordReset,
  useUpdateAdminUser,
} from '@/hooks/admin/useAdminUsers'
import type { AdminRole } from '@/types/admin'

const ROLES: AdminRole[] = ['student', 'teacher', 'admin']

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: user, isLoading, isError } = useAdminUser(id)
  const update = useUpdateAdminUser(id)
  const resetPassword = useSendPasswordReset()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <p className="muted">Loading…</p>
  if (isError || !user) return <p className="muted">Could not load this user.</p>

  const changeRole = async (role: AdminRole) => {
    setError(null)
    try {
      await update.mutateAsync({ role })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'Could not change the role.')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Administration · Users</div>
          <h1 className="h1">{user.name}</h1>
          <div className="muted">{user.email}</div>
        </div>
        <Badge tone={user.is_active ? 'success' : 'danger'}>
          {user.is_active ? 'Active' : 'Deactivated'}
        </Badge>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h2">Role</h2>
        <select
          value={user.role}
          onChange={e => changeRole(e.target.value as AdminRole)}
          disabled={update.isPending}
        >
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {error && <p className="muted" role="alert">{error}</p>}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h2">Access</h2>
        <button
          className="btn"
          onClick={() => resetPassword.mutate(id)}
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending ? 'Sending…' : 'Send password reset link'}
        </button>
        {resetPassword.isSuccess && <p className="muted">Reset link sent.</p>}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h2">Courses taught</h2>
        {user.courses.length === 0
          ? <p className="muted">None.</p>
          : <ul>{user.courses.map(c => <li key={c.id}>{c.title}</li>)}</ul>}
      </section>

      <section>
        <h2 className="h2">Enrollments</h2>
        {user.enrollments.length === 0
          ? <p className="muted">None.</p>
          : <ul>{user.enrollments.map(e => <li key={e.id}>{e.course_id}</li>)}</ul>}
      </section>
    </div>
  )
}
