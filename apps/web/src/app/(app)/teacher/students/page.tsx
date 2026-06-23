'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Progress, SegControl } from '@/components/ui'
import { useTeacherStudents } from '@/hooks/teacher/useStudents'
import { InviteStudentModal } from '@/components/teacher/InviteStudentModal'
import type { TeacherStudent } from '@/types/course'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'on_track', label: 'On track' },
  { value: 'at_risk', label: 'At-risk' },
]

function statusLabel(status: TeacherStudent['status']) {
  if (status === 'excelling') return 'Excelling'
  if (status === 'at_risk') return 'At-risk'
  return 'On track'
}

function statusTone(status: TeacherStudent['status']): 'success' | 'brand' | 'danger' {
  if (status === 'excelling') return 'success'
  if (status === 'at_risk') return 'danger'
  return 'brand'
}

export default function TeacherRosterPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showInvite, setShowInvite] = useState(false)
  const { data: students = [], isLoading, isError } = useTeacherStudents()

  const items = students
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Students</div>
          <h1 className="h1">
            Class roster{' '}
            <span className="muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 500, marginLeft: 8 }}>
              · {students.length}
            </span>
          </h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-brand" onClick={() => setShowInvite(true)}>
            Invite student
          </button>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 20, gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <input
            className="input"
            placeholder="Search students…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <SegControl options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {isLoading && <div className="muted">Loading roster…</div>}

      {isError && (
        <div className="card card-pad" style={{ color: 'var(--danger)' }}>
          Could not load students.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Courses</th>
                <th>Attendance</th>
                <th>Avg score</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 32 }}>
                    No students enrolled yet. Invite your first student.
                  </td>
                </tr>
              ) : (
                items.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={s.name} color={s.color} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={statusTone(s.status)}>{statusLabel(s.status)}</Badge>
                    </td>
                    <td className="num">{s.courses_count ?? '—'}</td>
                    <td className="num">
                      <div className="row" style={{ gap: 8 }}>
                        <span>{s.attendance_pct}%</span>
                        <div style={{ flex: 1, maxWidth: 60 }}>
                          <Progress value={s.attendance_pct} variant="brand" />
                        </div>
                      </div>
                    </td>
                    <td className="num"><b>{s.avg_score}%</b></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && <InviteStudentModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
