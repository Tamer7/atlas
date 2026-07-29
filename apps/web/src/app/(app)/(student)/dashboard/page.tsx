'use client'
import { useRouter } from 'next/navigation'
import { Sparkles, Clock, ArrowRight, Video, CalendarDays, ClipboardList } from 'lucide-react'
import { Progress, Badge, CourseThumb } from '@/components/ui'
import { useCourses } from '@/hooks/courses/useCourses'
import { useStudentLiveClasses } from '@/hooks/live/useLiveClasses'
import { useDueAssignments } from '@/hooks/profile/useProfile'
import { useMySchedule } from '@/hooks/schedule/useSchedule'
import { useAuth } from '@/contexts/AuthContext'
import type { LiveClass } from '@/lib/api/live'

function isToday(iso: string | null): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

function formatDue(iso: string | null): string {
  if (!iso) return ''
  const due = new Date(iso)
  const days = Math.ceil((due.getTime() - Date.now()) / 86400000)
  if (days < 0) return 'overdue'
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  return `due ${due.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}`
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: courses = [] } = useCourses()
  const { data: liveClasses = [] } = useStudentLiveClasses()
  const { data: dueAssignments = [] } = useDueAssignments()
  const { data: schedule = [] } = useMySchedule()

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const upNext = courses[0]

  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayDow = ((new Date().getDay() + 6) % 7) + 1

  const todaySlots = schedule.filter(s => s.day_of_week === todayDow)
  const liveNow = liveClasses.filter((c: LiveClass) => c.status === 'live')
  const liveToday = liveClasses.filter(
    (c: LiveClass) => c.status === 'scheduled' && isToday(c.scheduled_at)
  )
  const upcomingLive = liveClasses
    .filter((c: LiveClass) => c.status === 'scheduled' && !isToday(c.scheduled_at))
    .slice(0, 3)

  const dueSoon = dueAssignments
    .filter(a => a.attempt_status !== 'submitted' && a.attempt_status !== 'graded')
    .slice(0, 4)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">{today}</div>
          <h1 className="h1">Welcome back, <span className="serif-italic">{firstName}</span>.</h1>
        </div>
      </div>

      {/* Hero — pick up where you left off */}
      {upNext ? (
        <div className="card elev" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
            <div style={{ padding: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                <Sparkles size={12} style={{ verticalAlign: '-2px' }} /> Pick up where you left off
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1.1, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {upNext.title}
              </div>
              <div className="muted" style={{ marginBottom: 20, fontSize: 14 }}>
                with {upNext.instructor?.name ?? 'your instructor'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--muted)', fontSize: 12 }}>
                <Clock size={12} />
                {upNext.lessons_done} of {upNext.lessons_total} lessons · {upNext.progress}% complete
              </div>
              <Progress value={upNext.progress} variant="brand" thick />
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button className="btn btn-brand btn-lg" onClick={() => router.push(`/courses/${upNext.id}`)}>
                  Continue learning
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => router.push(`/courses/${upNext.id}`)}>
                  Course overview
                </button>
              </div>
            </div>
            <div className="grad-1" style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 28, minHeight: 260 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,.18), transparent 50%)' }} />
              <div style={{ position: 'absolute', top: -40, right: -40, fontFamily: 'var(--font-display)', fontSize: 280, lineHeight: 1, color: 'rgba(255,255,255,.15)', userSelect: 'none' }}>
                {upNext.title[0]}
              </div>
              <div style={{ position: 'relative', color: '#fff' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: .8, marginBottom: 6 }}>
                  {upNext.tag}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.2, opacity: .95 }}>
                  {upNext.lessons_total - upNext.lessons_done} lessons remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card elev" style={{ padding: 40, marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>No courses yet</div>
          <div className="muted" style={{ marginBottom: 20 }}>Enroll in a course to start learning.</div>
          <button className="btn btn-brand" onClick={() => router.push('/courses')}>Browse courses</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* In progress */}
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">In progress</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/courses')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {courses.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No courses enrolled yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {courses.map(c => (
                <button
                  key={c.id}
                  className="card"
                  style={{ padding: 0, overflow: 'hidden', textAlign: 'left', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer' }}
                  onClick={() => router.push(`/courses/${c.id}`)}
                >
                  <CourseThumb course={c} />
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{c.tag}</div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, lineHeight: 1.3 }}>{c.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
                      <span>{c.lessons_done}/{c.lessons_total} lessons</span>
                      <span className="dot-sep" />
                      <span>{c.progress}%</span>
                    </div>
                    <div style={{ marginTop: 8 }}><Progress value={c.progress} variant="brand" /></div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Today + Due soon + Upcoming live */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div className="between" style={{ marginBottom: 16 }}>
              <h2 className="h2">Today</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => router.push('/schedule')}>
                <CalendarDays size={12} /> Full schedule
              </button>
            </div>
            <div className="card card-pad">
              {liveNow.length === 0 && liveToday.length === 0 && todaySlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>
                  No classes today.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {liveNow.map((lc: LiveClass) => (
                    <button
                      key={lc.id}
                      className="card"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--danger)', background: 'var(--danger-tint)' }}
                      onClick={() => router.push(`/live/room?classId=${lc.id}`)}
                    >
                      <Badge tone="danger">Live now</Badge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{lc.title}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{lc.course?.title}</div>
                      </div>
                      <ArrowRight size={14} color="var(--danger)" />
                    </button>
                  ))}
                  {liveToday.map((lc: LiveClass) => (
                    <div key={lc.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ minWidth: 92, fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {lc.scheduled_at
                          ? new Date(lc.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
                          : 'TBD'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          <Video size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                          {lc.title}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>{lc.course?.title} · live class</div>
                      </div>
                    </div>
                  ))}
                  {todaySlots.map(slot => (
                    <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ minWidth: 92, fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {slot.start_time}–{slot.end_time}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{slot.course?.title}</div>
                        {slot.label && <div className="muted" style={{ fontSize: 12 }}>{slot.label}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="between" style={{ marginBottom: 16 }}>
              <h2 className="h2">Due soon</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => router.push('/profile')}>
                <ClipboardList size={12} /> All grades
              </button>
            </div>
            <div className="card card-pad">
              {dueSoon.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>
                  Nothing due right now.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {dueSoon.map(a => {
                    const overdue = a.due_at && new Date(a.due_at).getTime() < Date.now()
                    return (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                          <div style={{ fontSize: 12, color: overdue ? 'var(--danger)' : 'var(--muted)' }}>
                            {a.course?.title} · {formatDue(a.due_at)}
                          </div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/quiz/${a.id}`)}>
                          {a.attempt_status === 'in_progress' ? 'Continue' : 'Start'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {upcomingLive.length > 0 && (
            <div>
              <h2 className="h2" style={{ marginBottom: 16 }}>Upcoming live classes</h2>
              <div className="card card-pad">
                {upcomingLive.map((lc: LiveClass, i: number) => (
                  <div
                    key={lc.id}
                    style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < upcomingLive.length - 1 ? '1px solid var(--line)' : '0' }}
                  >
                    <div style={{
                      width: 44, textAlign: 'center', padding: '6px 0',
                      background: 'var(--paper-2)', color: 'var(--ink)',
                      borderRadius: 'var(--r-sm)', flexShrink: 0,
                    }}>
                      {lc.scheduled_at ? (
                        <>
                          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: .8 }}>
                            {new Date(lc.scheduled_at).toLocaleDateString('en', { month: 'short' })}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>
                            {new Date(lc.scheduled_at).getDate()}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 10, opacity: .6 }}>TBD</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Badge><Video size={10} /> Live class</Badge>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{lc.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {lc.course?.title}
                        {lc.scheduled_at && ` · ${new Date(lc.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
