'use client'
import { Calendar, X } from '@/components/ui'
import { Field } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

export function ScheduleModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 'min(560px, 96vw)', maxHeight: '90vh', overflow: 'auto', padding: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="between" style={{ marginBottom: 20 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>New session</div>
            <h2 className="h3">Schedule a live class</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="col" style={{ gap: 16 }}>
          <Field label="Class title">
            <input className="input" defaultValue="Mixed Conditionals — Live Workshop" />
          </Field>
          <Field label="Course">
            <select className="select">
              {MOCK.courses.map(c => <option key={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Date"><input className="input" type="date" defaultValue="2026-06-15" /></Field>
            <Field label="Time"><input className="input" type="time" defaultValue="13:30" /></Field>
            <Field label="Duration">
              <select className="select">
                <option>45 min</option>
                <option>60 min</option>
                <option>90 min</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Capacity"><input className="input" defaultValue="20" /></Field>
            <Field label="Visibility">
              <select className="select">
                <option>Enrolled students</option>
                <option>Invite only</option>
                <option>Public</option>
              </select>
            </Field>
          </div>
          <div className="card" style={{ padding: 14, background: 'var(--paper-2)', border: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Session features</div>
            <div className="col" style={{ gap: 8, fontSize: 13 }}>
              <label className="row" style={{ gap: 8 }}><input type="checkbox" defaultChecked /> Record automatically &amp; publish to course</label>
              <label className="row" style={{ gap: 8 }}><input type="checkbox" defaultChecked /> Collaborative whiteboard (students can draw)</label>
              <label className="row" style={{ gap: 8 }}><input type="checkbox" defaultChecked /> Allow student screen share on request</label>
              <label className="row" style={{ gap: 8 }}><input type="checkbox" /> Require approval to join</label>
            </div>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 4 }}>
            <button className="btn btn-secondary btn-block" onClick={onClose}>Cancel</button>
            <button className="btn btn-brand btn-block" onClick={onClose}><Calendar size={14} /> Schedule class</button>
          </div>
        </div>
      </div>
    </div>
  )
}
