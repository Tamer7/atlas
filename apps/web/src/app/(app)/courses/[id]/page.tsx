'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Check, ListChecks, Lock, MessageCircle } from 'lucide-react'
import { Badge, Progress, Avatar } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const c = MOCK.courses.find(c => String(c.id) === id) ?? MOCK.courses[0]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a href="/courses" onClick={e => { e.preventDefault(); router.push('/courses') }}>Courses</a> / {c.title}
          </div>
          <h1 className="h1" style={{ maxWidth: 700 }}>{c.title}</h1>
          <div className="row" style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>
            <span>with <b style={{ color: 'var(--ink)' }}>{c.instructor}</b></span>
            <span className="dot-sep" />
            <span>{c.lessonsTotal} lessons</span>
            <span className="dot-sep" />
            <span>8h 24m</span>
            <span className="dot-sep" />
            <Badge tone="brand">{c.tag}</Badge>
          </div>
        </div>
        <button className="btn btn-brand btn-lg" onClick={() => router.push(`/courses/${c.id}/lessons/l15`)}>
          <Play size={16} /> Continue · Lesson {c.lessonsDone + 1}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">Curriculum</h2>
            <div className="muted" style={{ fontSize: 13 }}>{c.lessonsDone} of {c.lessonsTotal} complete</div>
          </div>

          {MOCK.modules.map(m => (
            <div key={m.id} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="eyebrow">{m.title}</div>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>
              <div className="card" style={{ padding: 0 }}>
                {m.lessons.map((l, li) => {
                  const isDone = 'done' in l && !!l.done
                  const isCurrent = 'current' in l && !!l.current
                  const isQuiz = 'quiz' in l && !!l.quiz
                  const isLocked = 'locked' in l && !!l.locked
                  const hasQuiz = 'hasQuiz' in l && !!l.hasQuiz
                  return (
                    <div key={l.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      borderBottom: li < m.lessons.length - 1 ? '1px solid var(--line)' : '0',
                      background: isCurrent ? 'var(--brand-tint)' : 'transparent',
                      cursor: isLocked ? 'default' : 'pointer',
                      opacity: isLocked ? .55 : 1,
                    }} onClick={() => !isLocked && router.push(`/courses/${c.id}/lessons/${l.id}`)}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                        background: isDone ? 'var(--success)' : isCurrent ? 'var(--brand)' : isQuiz ? 'var(--accent-tint)' : 'var(--paper-2)',
                        color: isDone || isCurrent ? '#fff' : isQuiz ? '#8B4426' : 'var(--muted)', flexShrink: 0 }}>
                        {isDone ? <Check size={14} /> : isQuiz ? <ListChecks size={13} /> : isLocked ? <Lock size={13} /> : <Play size={11} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                          {!isQuiz && <span style={{ color: 'var(--muted)', marginRight: 8 }}>Lesson {l.n}</span>}
                          {l.title}
                          {isCurrent && <Badge tone="brand" style={{ marginLeft: 10 }}>Current</Badge>}
                          {isQuiz && <Badge tone="accent" style={{ marginLeft: 10 }}>Quiz</Badge>}
                          {hasQuiz && <span style={{ marginLeft: 10, color: 'var(--muted)', fontSize: 11 }}>+ quiz</span>}
                        </div>
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{l.duration}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card card-pad-lg">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your progress</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 44, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{c.progress}%</div>
              <div className="muted">complete</div>
            </div>
            <Progress value={c.progress} variant="brand" thick />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              <span>{c.lessonsDone} done</span>
              <span>{c.lessonsTotal - c.lessonsDone} remaining</span>
            </div>
            <hr className="divider" />
            <div className="eyebrow" style={{ marginBottom: 10 }}>Instructor</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={c.instructor} size="lg" color="#2747E0" />
              <div>
                <div style={{ fontWeight: 600 }}>{c.instructor}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Senior Language Coach · 8 yrs</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 12 }}>
              <MessageCircle size={12} /> Message instructor
            </button>
          </div>

          <div className="card card-pad-lg" style={{ marginTop: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Assessments</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--r-sm)', background: 'var(--paper-2)' }}>
                <ListChecks size={14} color="var(--brand)" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>Conditionals practice quiz</span>
                <Badge tone="brand">Due Wed</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--r-sm)', background: 'var(--paper-2)' }}>
                <ListChecks size={14} color="var(--danger)" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>End-of-term exam</span>
                <Badge tone="danger">Due Fri</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
