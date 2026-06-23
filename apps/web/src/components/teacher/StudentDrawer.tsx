'use client'
import { Avatar, Badge, X, CheckCircle, ChatBubble, FileText } from '@/components/ui'

type RosterStudent = {
  id: string
  name: string
  courses: number
  attendance: number
  avgScore: number
  status: string
  last: string
  flagged: boolean
  color: string
}

const ACTIVITY = [
  { id: 'a1', what: 'Submitted Mixed Conditionals quiz', score: 80, when: '2h ago' },
  { id: 'a2', what: 'Watched Lesson 14 — 2nd conditional', score: null as number | null, when: 'Yesterday' },
  { id: 'a3', what: 'Posted question in Q&A', score: null as number | null, when: '2d ago' },
  { id: 'a4', what: 'Submitted Reduced forms quiz', score: 90, when: '5d ago' },
]

export function StudentDrawer({ student, onClose }: Readonly<{ student: RosterStudent; onClose: () => void }>) {
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
              <div className="muted" style={{ fontSize: 12 }}>{student.name.toLowerCase().replace(' ', '.')}@email.com</div>
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
