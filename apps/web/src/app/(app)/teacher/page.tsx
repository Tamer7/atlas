'use client'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, ArrowRight, Calendar, Plus, Flag, Clock } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

export default function TeacherDashboardPage() {
  const router = useRouter()

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Tuesday, May 19</div>
          <h1 className="h1">Good morning, <span className="serif-italic">Prof. Vale</span>.</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary"><Calendar size={14} /> May 2026</button>
          <button className="btn btn-brand"><Plus size={14} /> Create</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Active students', value: '47', sub: 'across 4 courses' },
          { label: 'Awaiting grading', value: '5', sub: 'items in queue', accent: true, href: '/teacher/grading' },
          { label: 'Avg. class score', value: '82%', sub: '↑ 3 pts this week' },
          { label: 'At-risk students', value: '2', sub: 'need attention', warn: true },
        ].map((s, i) => (
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
            {MOCK.gradingQueue.slice(0, 4).map((g, i) => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < 3 ? '1px solid var(--line)' : '0',
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/teacher/grading')}
              >
                <Avatar name={g.student} color={g.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <b style={{ fontSize: 13 }}>{g.student}</b>
                    <Badge tone={g.type === 'Exam' ? 'danger' : 'brand'}>{g.type}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{g.item} · {g.course} · {g.submitted}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{g.needsReview} need review</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {g.autoScore != null ? `${g.autoScore}/${g.total} auto` : 'Manual'}
                  </div>
                </div>
                <ArrowRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>

        {/* Today + alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 className="h2" style={{ marginBottom: 16 }}>Today's schedule</h2>
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
    </div>
  )
}
