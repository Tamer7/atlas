'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, ArrowRight, Calendar, Plus, Flag, Clock } from '@/components/ui'
import { Pencil, Users, Video } from 'lucide-react'
import { CreateCourseModal } from '@/components/teacher/CreateCourseModal'
import { InviteStudentModal } from '@/components/teacher/InviteStudentModal'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/hooks/analytics/useDashboard'
import { useTeacherLiveClasses } from '@/hooks/live/useLiveClasses'
import { useMySchedule } from '@/hooks/schedule/useSchedule'
import { useTeacherQuizzes } from '@/hooks/assessment/useQuizzes'
import { useTeacherStudents } from '@/hooks/teacher/useStudents'
import { avatarColor, formatRelativeTime } from '@/lib/quiz/helpers'
import type { GradingQueueItem } from '@/types/assessment'
import type { LiveClass } from '@/lib/api/live'

function queueTypeLabel(item: GradingQueueItem): string {
  if (item.quiz_title.toLowerCase().includes('exam')) return 'Exam'
  return 'Quiz'
}

function isToday(iso: string | null): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

export default function TeacherDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: dashboard, isLoading, isError } = useDashboard()
  const { data: schedule = [] } = useMySchedule()
  const { data: liveClasses = [] } = useTeacherLiveClasses()
  const { data: quizzes = [] } = useTeacherQuizzes()
  const { data: students = [] } = useTeacherStudents()
  const [showCreate, setShowCreate] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const firstName = (user?.name?.split(' ')[0] ?? 'there').replace(/\.+$/, '')

  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayDow = ((new Date().getDay() + 6) % 7) + 1
  const todaySlots = schedule.filter(s => s.day_of_week === todayDow)
  const liveTodayOrNow = liveClasses.filter(
    (lc: LiveClass) => lc.status === 'live' || (lc.status === 'scheduled' && isToday(lc.scheduled_at))
  )

  const atRisk = students.filter(s => s.status === 'at_risk').slice(0, 2)
  const upcomingDue = quizzes
    .filter(q => q.due_at && new Date(q.due_at).getTime() > Date.now())
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())
    .slice(0, 2)

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
          <div className="crumbs">{today}</div>
          <h1 className="h1">Welcome back, <span className="serif-italic">{firstName}</span>.</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => router.push('/teacher/quizzes/new')}>
            <Pencil size={13} /> New quiz
          </button>
          <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
            <Users size={13} /> Invite student
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/schedule')}>
            <Calendar size={14} /> Schedule
          </button>
          <button className="btn btn-brand" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New course
          </button>
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

        {/* Today + attention */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div className="between" style={{ marginBottom: 16 }}>
              <h2 className="h2">Today&apos;s schedule</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => router.push('/schedule')}>
                Full calendar <ArrowRight size={12} />
              </button>
            </div>
            <div className="card card-pad">
              {liveTodayOrNow.length === 0 && todaySlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>
                  No classes today.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {liveTodayOrNow.map((lc: LiveClass) => (
                    <div key={lc.id} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ width: 4, background: 'var(--danger)', borderRadius: 4, alignSelf: 'stretch' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          <Video size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                          {lc.title}
                          {lc.status === 'live' && <Badge tone="danger" style={{ marginLeft: 6 }}>Live</Badge>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lc.course?.title} · live class</div>
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                        {lc.scheduled_at
                          ? new Date(lc.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
                          : 'now'}
                      </div>
                    </div>
                  ))}
                  {todaySlots.map(slot => (
                    <div key={slot.id} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ width: 4, background: 'var(--brand)', borderRadius: 4, alignSelf: 'stretch' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{slot.course?.title}</div>
                        {slot.label && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{slot.label}</div>}
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                        {slot.start_time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(atRisk.length > 0 || upcomingDue.length > 0) && (
            <div>
              <h2 className="h2" style={{ marginBottom: 16 }}>Needs your attention</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {atRisk.map(s => (
                  <div
                    key={s.id}
                    className="card card-pad"
                    style={{ borderColor: 'var(--danger-tint)', background: 'var(--danger-tint)' }}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <Flag size={16} color="var(--danger)" />
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: 13 }}>{s.name}</b> is at risk
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          Avg score {s.avg_score}% · attendance {s.attendance_pct}%
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => router.push('/teacher/students')}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingDue.map(q => (
                  <div
                    key={q.id}
                    className="card card-pad"
                    style={{ borderColor: 'var(--accent-tint)', background: 'var(--accent-tint)' }}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <Clock size={16} color="var(--accent)" />
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: 13 }}>{q.title}</b> closes{' '}
                        {new Date(q.due_at!).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{q.course_title}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/teacher/quizzes/${q.id}/edit`)}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} />}
      {showInvite && <InviteStudentModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
