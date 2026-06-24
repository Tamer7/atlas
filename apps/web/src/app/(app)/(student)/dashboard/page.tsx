'use client'
import { useRouter } from 'next/navigation'
import { Sparkles, Clock, ArrowRight, Video } from 'lucide-react'
import { Stat, Progress, Badge, CourseThumb } from '@/components/ui'
import { useCourses } from '@/hooks/courses/useCourses'
import { useStudentLiveClasses } from '@/hooks/live/useLiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import type { LiveClass } from '@/lib/api/live'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: courses = [] } = useCourses()
  const { data: liveClasses = [] } = useStudentLiveClasses()

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const upNext = courses[0]

  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })

  const upcomingLive = liveClasses
    .filter((c: LiveClass) => c.status === 'scheduled' || c.status === 'live')
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

      {/* In progress + This week */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
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

        <div>
          <h2 className="h2" style={{ marginBottom: 16 }}>Upcoming live classes</h2>
          <div className="card card-pad">
            {upcomingLive.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
                No live classes scheduled yet.
              </div>
            ) : (
              upcomingLive.map((lc: LiveClass, i: number) => (
                <div
                  key={lc.id}
                  style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < upcomingLive.length - 1 ? '1px solid var(--line)' : '0', cursor: lc.status === 'live' ? 'pointer' : 'default' }}
                  onClick={() => lc.status === 'live' && router.push(`/live/room?classId=${lc.id}`)}
                >
                  <div style={{
                    width: 44, textAlign: 'center', padding: '6px 0',
                    background: lc.status === 'live' ? 'var(--brand)' : 'var(--paper-2)',
                    color: lc.status === 'live' ? '#fff' : 'var(--ink)',
                    borderRadius: 'var(--r-sm)', flexShrink: 0,
                  }}>
                    {lc.status === 'live' ? (
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</div>
                    ) : lc.scheduled_at ? (
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
                      {lc.status === 'live'
                        ? <Badge tone="danger">Live now</Badge>
                        : <Badge><Video size={10} /> Live class</Badge>
                      }
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{lc.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {lc.course?.title}
                      {lc.scheduled_at && ` · ${new Date(lc.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>
                  {lc.status === 'live' && <ArrowRight size={14} color="var(--brand)" style={{ flexShrink: 0, alignSelf: 'center' }} />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
