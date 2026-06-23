import { ReactNode } from 'react'
export function Field({ label, help, hint, children }: { label?: string; help?: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && <label className="label">{label}{hint && <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>{hint}</span>}</label>}
      {children}
      {help && <div className="help">{help}</div>}
    </div>
  )
}
