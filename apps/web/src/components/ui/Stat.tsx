export function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.01em', color: accent ? 'var(--brand)' : 'var(--ink)' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  )
}
