'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, ArrowRight, Calendar, Plus, Flag, Clock } from '@/components/ui'
import { CreateCourseModal } from '@/components/teacher/CreateCourseModal'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/hooks/analytics/useDashboard'
import { avatarColor, formatRelativeTime } from '@/lib/quiz/helpers'
import type { GradingQueueItem } from '@/types/assessment'

function queueTypeLabel(item: GradingQueueItem): string {
  if (item.quiz_title.toLowerCase().includes('exam')) return 'Exam'
  return 'Quiz'
}

export default function TeacherDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: dashboard, isLoading, isError } = useDashboard()
  const [showCreate, setShowCreate] = useState(false)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const stats = dashboard?.stats
  const queue = dashboard?.grading_queue ?? []

  const statCards = stats
    ? [
        {
          label: 'Active students',
          value: String(stats.active_students),
          sub: `across ${stats.courses_count} course${stats.courses_count === 1 ? '' : 's'}`,
        },
        {
          label: 'Awaiting grading',
          value: String(stats.awaiting_grading),
          sub: 'items in queue',
          accent: true,
          href: '/teacher/grading',
        },
        {
          label: 'Avg. class score',
          value: `${Math.round(stats.avg_class_score)}%`,
          sub:
            stats.avg_class_score_change != null
              ? `${stats.avg_class_score_change >= 0 ? '↑' : '↓'} ${Math.abs(stats.avg_class_score_change)} pts this week`
              : 'across all courses',
        },
        {
          label: 'At-risk students',
          value: String(stats.at_risk_students),
          sub: 'need attention',
          warn: true,
        },
      ]
    : []

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Tuesday, May 19</div>
          <h1 className="h1">Good morning, <span className="serif-italic">{firstName}</span>.</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary"><Calendar size={14} /> May 2026</button>
          <button className="btn btn-brand" onClick={() => setShowCreate(true)}><Plus size={14} /> Create</button>
        </div>
      </div>

      {isLoading && <div className="muted" style={{ marginBottom: 24 }}>Loading dashboard…</div>}
      {isError && <div className="muted" style={{ marginBottom: 24 }}>Could not load dashboard data.</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <div
            key={i}
            className="card card-pad-lg"
            onClick={() => s.href && router.push(s.href)}
            style={{ cursor: s.href ? 'pointer' : 'default' }}
          >
            <div className="eyebrow" style={{ marginBottom: 10 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{
                fontSize: 36,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                color: s.accent ? 'var(--brand)' : s.warn ? 'var(--danger)' : 'var(--ink)',
              }}>
                {s.value}
              </div>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Grading queue preview */}
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">Grading queue</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/teacher/grading')}>
              Open queue <ArrowRight size={12} />
            </button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            {queue.length === 0 && !isLoading && (
              <div className="card-pad muted" style={{ fontSize: 13 }}>No submissions awaiting grading.</div>
            )}
            {queue.slice(0, 4).map((g, i) => (
              <div
                key={g.attempt_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < Math.min(queue.length, 4) - 1 ? '1px solid var(--line)' : '0',
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/teacher/grading')}
              >
                <Avatar name={g.student.name} color={avatarColor(g.student.name)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <b style={{ fontSize: 13 }}>{g.student.name}</b>
                    <Badge tone={queueTypeLabel(g) === 'Exam' ? 'danger' : 'brand'}>{queueTypeLabel(g)}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {g.quiz_title} · {g.course_title} · {formatRelativeTime(g.submitted_at)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{g.pending_count} need review</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Manual</div>
                </div>
                <ArrowRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>

        {/* Today + alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 className="h2" style={{ marginBottom: 16 }}>Today&apos;s schedule</h2>
            <div className="card card-pad">
              {[
                { time: '10:00', title: 'Office hours · English B2', who: '8 students booked', color: 'var(--brand)' },
                { time: '13:30', title: 'Live class · IELTS Writing', who: '12 attending', color: 'var(--accent)' },
                { time: '16:00', title: '1-on-1 with Yuna Park', who: '30 min · Spanish A2', color: 'var(--success)' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '10px 0',
                    borderBottom: i < 2 ? '1px solid var(--line)' : '0',
                  }}
                >
                  <div style={{ width: 4, background: s.color, borderRadius: 4, alignSelf: 'stretch' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.who}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{s.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="h2" style={{ marginBottom: 16 }}>Needs your attention</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                className="card card-pad"
                style={{ borderColor: 'var(--danger-tint)', background: 'var(--danger-tint)' }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <Flag size={16} color="var(--danger)" />
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13 }}>Priya Raman</b> hasn&apos;t logged in for 7 days
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Avg score dropped 12 points</div>
                  </div>
                  <button className="btn btn-secondary btn-sm">Reach out</button>
                </div>
              </div>
              <div
                className="card card-pad"
                style={{ borderColor: 'var(--warning-tint)', background: 'var(--warning-tint)' }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <Clock size={16} color="var(--warning)" />
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13 }}>Exam closes Fri</b> — End-of-term comprehensive
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>32 students have started · 18 not started</div>
                  </div>
                  <button className="btn btn-secondary btn-sm">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
