interface Tab { id: string; label: string; count?: number }
export function Tabs({ tabs, value, onChange }: { tabs: Tab[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.id} className={value === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          {t.label}{t.count != null && <span style={{ marginLeft: 6, color: 'var(--muted)', fontWeight: 500 }}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
