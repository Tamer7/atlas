'use client'
import { useRouter } from 'next/navigation'
import { Sparkles, Clock, Play, ArrowRight, ListChecks } from 'lucide-react'
import { Stat, Progress, Badge, CourseThumb } from '@/components/ui'
import { useCourses } from '@/hooks/courses/useCourses'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: courses = [] } = useCourses()
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const upNext = courses[0]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Tuesday, May 19</div>
          <h1 className="h1">Welcome back, <span className="serif-italic">{firstName}</span>.</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary">Search lessons</button>
          <button className="btn btn-secondary btn-icon" aria-label="Notifications">🔔</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="card card-pad-lg" style={{ marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center' }}>
        <Stat label="This week" value="4.2h" sub="of 5h goal" accent />
        <div style={{ width: 1, height: 40, background: 'var(--line)' }} />
        <Stat label="Active streak" value="11" sub="days" />
        <div style={{ width: 1, height: 40, background: 'var(--line)' }} />
        <Stat label="Lessons done" value="36" sub="of 96 total" />
        <div style={{ width: 1, height: 40, background: 'var(--line)' }} />
        <Stat label="Avg. score" value="88%" sub="↑ 4 pts" />
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={() => router.push('/results/demo')}>
          See progress <ArrowRight size={14} />
        </button>
      </div>

      {/* Hero card */}
      <div className="card elev" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
          <div style={{ padding: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              <Sparkles size={12} style={{ verticalAlign: '-2px' }} /> Pick up where you left off
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1.05, marginBottom: 6, letterSpacing: '-0.01em' }}>
              Lesson 15 · <span className="serif-italic">Mixed Conditionals</span>
            </div>
            <div className="muted" style={{ marginBottom: 20 }}>
              {upNext ? `${upNext.title} · with ${upNext.instructor.name}` : 'No courses enrolled yet.'}
            </div>
            {upNext && (
              <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--muted)', fontSize: 12 }}>
              <Clock size={12} /> Continue learning
              <span className="dot-sep" /> <Play size={12} /> {upNext.progress}% through
            </div>
            <Progress value={upNext.progress} variant="brand" thick />
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn btn-secondary btn-lg" onClick={() => router.push(`/courses/${upNext.id}`)}>
                Course overview
              </button>
            </div>
              </>
            )}
          </div>
          <div className="grad-1" style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 28, minHeight: 280 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,.18), transparent 50%)' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, fontFamily: 'var(--font-display)', fontSize: 280, lineHeight: 1, color: 'rgba(255,255,255,.15)', userSelect: 'none' }}>E</div>
            <div style={{ position: 'relative', color: '#fff' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: .8, marginBottom: 6 }}>Coming up next</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.1, opacity: .95 }}>
                &ldquo;If she had taken that job last year, she would be living in Lisbon right now.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In progress + This week */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">In progress</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/courses')}>View all <ArrowRight size={12} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {courses.map(c => (
              <button key={c.id} className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer' }}
                onClick={() => router.push(`/courses/${c.id}`)}>
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
        </div>

        <div>
          <h2 className="h2" style={{ marginBottom: 16 }}>This week</h2>
          <div className="card card-pad">
            {[
              { day: 'Tue', date: 19, type: 'lesson', title: 'Mixed conditionals', course: 'English B2', time: 'Anytime today', active: true },
              { day: 'Wed', date: 20, type: 'quiz', title: 'Conditionals practice quiz', course: 'English B2', time: '10 questions' },
              { day: 'Thu', date: 21, type: 'lesson', title: 'Ser vs Estar in context', course: 'Spanish A2', time: 'with Diego' },
              { day: 'Fri', date: 22, type: 'exam', title: 'End-of-Term Comprehensive', course: 'English B2', time: '90 min · proctored', warn: true },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--line)' : '0' }}>
                <div style={{ width: 44, textAlign: 'center', padding: '6px 0', background: it.active ? 'var(--ink)' : 'var(--paper-2)', color: it.active ? 'var(--paper)' : 'var(--ink)', borderRadius: 'var(--r-sm)', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: .8 }}>{it.day}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>{it.date}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    {it.type === 'quiz' && <Badge tone="brand">Quiz</Badge>}
                    {it.type === 'exam' && <Badge tone="danger">Exam</Badge>}
                    {it.type === 'lesson' && <Badge>Lesson</Badge>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{it.course} · {it.time}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="h2" style={{ margin: '32px 0 16px' }}>Recent results</h2>
          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Reduced forms quiz', course: 'English B2', score: 90, when: '2 days ago' },
              { title: 'Linking sounds quiz', course: 'English B2', score: 85, when: '5 days ago' },
              { title: 'Vocab check 3', course: 'Spanish A2', score: 92, when: '1 week ago' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.score >= 85 ? 'var(--success-tint)' : 'var(--warning-tint)', color: r.score >= 85 ? 'var(--success)' : 'var(--warning)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  {r.score}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.course} · {r.when}</div>
                </div>
                <ArrowRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
