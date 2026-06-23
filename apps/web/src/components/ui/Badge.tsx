import { ReactNode, CSSProperties } from 'react'

type Tone = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'accent'

export function Badge({ tone = 'default', dot, children, style }: {
  tone?: Tone; dot?: boolean; children?: ReactNode; style?: CSSProperties
}) {
  const cls = ['badge', tone !== 'default' ? `badge-${tone}` : '', dot ? 'badge-dot' : ''].filter(Boolean).join(' ')
  return <span className={cls} style={style}>{children}</span>
}
