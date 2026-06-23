interface Option { value: string; label: string }
export function SegControl({ options, value, onChange }: { options: Option[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', padding: 3, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', gap: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          background: value === o.value ? 'var(--card)' : 'transparent',
          boxShadow: value === o.value ? 'var(--sh-sm)' : 'none',
          border: 0, padding: '6px 12px', borderRadius: 'var(--r-sm)',
          fontWeight: 600, fontSize: 12, cursor: 'pointer',
          color: value === o.value ? 'var(--ink)' : 'var(--muted)',
        }}>{o.label}</button>
      ))}
    </div>
  )
}
