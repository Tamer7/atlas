'use client'
import { useState } from 'react'
import { Avatar, Badge, Progress, SegControl, Sparkline, Search, Upload, Plus, Filter, Flag, X, CheckCircle, ChatBubble, FileText } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

type RosterStudent = (typeof MOCK.roster)[number]

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'excelling', label: 'Excelling' },
  { value: 'on-track', label: 'On track' },
  { value: 'at-risk', label: 'At-risk' },
]

const ACTIVITY = [
  { id: 'a1', what: 'Submitted Mixed Conditionals quiz', score: 80, when: '2h ago' },
  { id: 'a2', what: 'Watched Lesson 14 — 2nd conditional', score: null as number | null, when: 'Yesterday' },
  { id: 'a3', what: 'Posted question in Q&A', score: null as number | null, when: '2d ago' },
  { id: 'a4', what: 'Submitted Reduced forms quiz', score: 90, when: '5d ago' },
]

function StudentDrawer({ student, onClose }: Readonly<{ student: RosterStudent; onClose: () => void }>) {
  return (
    <dialog
      open
      aria-modal="true"
      aria-label={`Student details for ${student.name}`}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', background: 'transparent', display: 'flex', justifyContent: 'flex-end', zIndex: 50, padding: 0, border: 0, maxWidth: 'none', maxHeight: 'none' }}
    >
      {/* Backdrop — native button satisfies the interactive-element rule */}
      <button
        aria-label="Close drawer"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'var(--overlay)', border: 0, cursor: 'default', padding: 0 }}
        onClick={onClose}
      />

      {/* Panel — plain content div, no click handler needed */}
      <div
        style={{ position: 'relative', width: 480, height: '100%', background: 'var(--card)', overflow: 'auto', padding: 28, boxShadow: 'var(--sh-pop)', zIndex: 1 }}
      >
        <div className="between" style={{ marginBottom: 24 }}>
          <div className="row">
            <Avatar name={student.name} color={student.color} size="lg" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{student.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{student.name.toLowerCase().replaceAll(' ', '.')}@email.com</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div className="card card-pad" style={{ background: 'var(--paper-2)', border: 0 }}>
            <div className="eyebrow">Avg score</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{student.avgScore}%</div>
          </div>
          <div className="card card-pad" style={{ background: 'var(--paper-2)', border: 0 }}>
            <div className="eyebrow">Attendance</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{student.attendance}%</div>
          </div>
          <div className="card card-pad" style={{ background: 'var(--paper-2)', border: 0 }}>
            <div className="eyebrow">Courses</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{student.courses}</div>
          </div>
        </div>

        <h3 className="h3" style={{ marginBottom: 12 }}>Recent activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {ACTIVITY.map(a => (
            <div key={a.id} className="row" style={{ padding: 10, borderRadius: 'var(--r-sm)', background: 'var(--paper)', gap: 10 }}>
              <CheckCircle size={14} color="var(--success)" />
              <div style={{ flex: 1, fontSize: 13 }}>{a.what}</div>
              {a.score !== null && <Badge tone="brand">{a.score}%</Badge>}
              <span className="muted" style={{ fontSize: 12 }}>{a.when}</span>
            </div>
          ))}
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-brand btn-block"><ChatBubble size={14} /> Message</button>
          <button className="btn btn-secondary btn-block"><FileText size={14} /> View profile</button>
        </div>
      </div>
    </dialog>
  )
}

export default function TeacherRosterPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<RosterStudent | null>(null)

  const items = MOCK.roster
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Students</div>
          <h1 className="h1">
            Class roster{' '}
            <span className="muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 500, marginLeft: 8 }}>
              · {MOCK.roster.length}
            </span>
          </h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary"><Upload size={14} /> Export CSV</button>
          <button className="btn btn-brand"><Plus size={14} /> Invite student</button>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 20, gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} color="var(--muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            className="input"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <SegControl options={FILTERS} value={filter} onChange={setFilter} />
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary"><Filter size={14} /> Course: All</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" /></th>
              <th>Student</th>
              <th>Status</th>
              <th>Courses</th>
              <th>Attendance</th>
              <th>Avg score</th>
              <th>Trend</th>
              <th>Last active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(s)}>
                <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={s.name} color={s.color} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {s.name.toLowerCase().replaceAll(' ', '.')}@email.com
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {s.status === 'excelling' && <Badge tone="success">Excelling</Badge>}
                  {s.status === 'on-track' && <Badge tone="brand">On track</Badge>}
                  {s.status === 'at-risk' && <Badge tone="danger">At-risk</Badge>}
                </td>
                <td className="num">{s.courses}</td>
                <td className="num">
                  <div className="row" style={{ gap: 8 }}>
                    <span>{s.attendance}%</span>
                    <div style={{ flex: 1, maxWidth: 60 }}>
                      <Progress value={s.attendance} variant={s.attendance > 85 ? 'brand' : 'default'} />
                    </div>
                  </div>
                </td>
                <td className="num"><b>{s.avgScore}%</b></td>
                <td>
                  <Sparkline
                    values={[s.avgScore - 8, s.avgScore - 4, s.avgScore - 6, s.avgScore - 2, s.avgScore, s.avgScore + 1, s.avgScore]}
                    positive={s.status !== 'at-risk'}
                  />
                </td>
                <td className="muted">{s.last}</td>
                <td>
                  {s.flagged && <Flag size={14} color="var(--danger)" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <StudentDrawer student={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
