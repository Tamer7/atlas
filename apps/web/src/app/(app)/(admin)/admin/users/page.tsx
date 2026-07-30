'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Avatar, Badge } from '@/components/ui'
import {
  useAdminUsers,
  useDeactivateUser,
  useReactivateUser,
} from '@/hooks/admin/useAdminUsers'
import type { AdminRole } from '@/types/admin'

const ROLE_FILTERS: { value: AdminRole | ''; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'admin', label: 'Admins' },
]

function extractErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? fallback
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<AdminRole | ''>('')
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError } = useAdminUsers({ search, role, status })
  const users = data?.users ?? []
  const total = data?.total ?? 0
  const deactivate = useDeactivateUser()
  const reactivate = useReactivateUser()

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Administration</div>
          <h1 className="h1">Users</h1>
        </div>
        <Link href="/admin/users/new" className="btn btn-brand">
          Add user
        </Link>
      </div>

      <div className="row" style={{ gap: 10, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input"
          aria-label="Filter by role"
          value={role}
          onChange={e => setRole(e.target.value as AdminRole | '')}
        >
          {ROLE_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Filter by status"
          value={status}
          onChange={e => setStatus(e.target.value as 'active' | 'inactive' | '')}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      {!isLoading && !isError && users.length > 0 && users.length < total && (
        <p className="muted" style={{ marginBottom: 16 }}>
          Showing {users.length} of {total} — refine your search to narrow results.
        </p>
      )}

      {actionError && (
        <div className="help" style={{ color: 'var(--danger)', marginBottom: 16 }} role="alert">
          {actionError}
        </div>
      )}

      {isLoading && <p className="muted">Loading users…</p>}
      {isError && <p className="muted">Could not load users.</p>}

      {!isLoading && !isError && users.length === 0 && (
        <p className="muted">No users match these filters.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {users.map(user => (
          <div
            key={user.id}
            className="card row"
            style={{ gap: 12, alignItems: 'center', padding: 14 }}
          >
            <Avatar name={user.name} />
            <div style={{ flex: 1 }}>
              <Link href={`/admin/users/${user.id}`}>{user.name}</Link>
              <div className="muted">{user.email}</div>
            </div>

            <Badge tone="brand">{user.role}</Badge>
            <Badge tone={user.is_active ? 'success' : 'danger'}>
              {user.is_active ? 'Active' : 'Deactivated'}
            </Badge>

            {user.is_active ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setActionError(null)
                  deactivate.mutate(user.id, {
                    onError: err =>
                      setActionError(extractErrorMessage(err, 'Could not deactivate this user.')),
                  })
                }}
                disabled={deactivate.isPending}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setActionError(null)
                  reactivate.mutate(user.id, {
                    onError: err =>
                      setActionError(extractErrorMessage(err, 'Could not reactivate this user.')),
                  })
                }}
                disabled={reactivate.isPending}
              >
                Reactivate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
