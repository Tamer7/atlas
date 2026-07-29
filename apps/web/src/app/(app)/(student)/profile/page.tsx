'use client'
import { useRouter } from 'next/navigation'
import { GraduationCap, MessageSquareText } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useMyGrades, useMyComments } from '@/hooks/profile/useProfile'
import type { Grade } from '@/types/profile'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

function gradeBadge(g: Grade) {
  if (g.status !== 'graded' || g.total_score === null) {
    return <Badge tone="accent">Pending</Badge>
  }
  const passed = g.total_score >= (g.quiz?.passing_score ?? 60)
  return <Badge tone={passed ? 'success' : 'danger'}>{g.total_score}%</Badge>
}

export default function StudentProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: grades = [], isLoading: gradesLoading } = useMyGrades()
  const { data: comments = [], isLoading: commentsLoading } = useMyComments()

  const gradedCount = grades.filter(g => g.status === 'graded' && g.total_score !== null)
  const avgScore = gradedCount.length > 0
    ? Math.round(gradedCount.reduce((s, g) => s + (g.total_score ?? 0), 0) / gradedCount.length)
    : null

  return (
    <div>
      <div className="page-head">
        <div className="row" style={{ gap: 16 }}>
          <Avatar name={user?.name ?? '??'} color={user?.color} size="lg" />
          <div>
            <div className="crumbs">My profile</div>
            <h1 className="h1">{user?.name ?? '…'}</h1>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{user?.email}</div>
          </div>
        </div>
        {avgScore !== null && (
          <div className="card card-pad" style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-display)' }}>{avgScore}%</div>
            <div className="muted" style={{ fontSize: 12 }}>Average score</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Grades */}
        <div>
          <h2 className="h2" style={{ marginBottom: 12 }}>
            <GraduationCap size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            Grades
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {gradesLoading ? (
              <div className="muted" style={{ padding: 20, fontSize: 13 }}>Loading…</div>
            ) : grades.length === 0 ? (
              <div className="muted" style={{ padding: 20, fontSize: 13 }}>
                No graded work yet. Your quiz results will appear here.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Course</th>
                    <th>Submitted</th>
                    <th>Score</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 600 }}>{g.quiz?.title}</td>
                      <td className="muted">{g.course?.title}</td>
                      <td className="muted">{formatDate(g.submitted_at)}</td>
                      <td>{gradeBadge(g)}</td>
                      <td>
                        {g.status === 'graded' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => router.push(`/results/${g.id}`)}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Teacher comments */}
        <div>
          <h2 className="h2" style={{ marginBottom: 12 }}>
            <MessageSquareText size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            Comments from your teachers
          </h2>
          {commentsLoading ? (
            <div className="card card-pad muted" style={{ fontSize: 13 }}>Loading…</div>
          ) : comments.length === 0 ? (
            <div className="card card-pad muted" style={{ fontSize: 13 }}>
              No comments yet. Feedback from your teachers will show up here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map(c => (
                <div key={c.id} className="card card-pad" style={{ display: 'flex', gap: 12 }}>
                  <Avatar name={c.teacher?.name ?? '?'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                      <b style={{ fontSize: 13 }}>{c.teacher?.name}</b>
                      <span className="muted" style={{ fontSize: 12 }}>· {formatDate(c.created_at)}</span>
                      {c.course && <Badge tone="brand" style={{ fontSize: 10 }}>{c.course.title}</Badge>}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
