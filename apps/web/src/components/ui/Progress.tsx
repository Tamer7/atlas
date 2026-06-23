export function Progress({ value = 0, variant = 'default', thick }: {
  value?: number; variant?: 'default' | 'brand'; thick?: boolean
}) {
  const cls = ['progress', variant === 'brand' ? 'brand' : '', thick ? 'thick' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
