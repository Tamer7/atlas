import type { CSSProperties } from 'react'

type Size = number | string

interface SkeletonProps {
  /** Width — number is treated as px, string is passed through (e.g. '60%'). */
  w?: Size
  /** Height — number is treated as px, string is passed through. */
  h?: Size
  /** Border radius override. */
  r?: Size
  circle?: boolean
  /** Use the light-on-dark variant (live classroom, video surfaces). */
  onDark?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * A single shimmering placeholder block.
 *
 * Skeletons exist so a refresh keeps the page's shape instead of collapsing to
 * an empty state — every list/detail view should render one while its query is
 * in flight rather than "Loading…" text.
 *
 * `h` deliberately has no default value: a default would still be applied when
 * a caller passes `h={undefined}`, and the resulting inline height would beat
 * the aspect-ratio set by shape classes like `sk-thumb`. The 12px fallback
 * lives in CSS on `.sk` instead, so those classes can override it.
 */
export function Skeleton({ w, h, r, circle, onDark, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`sk${circle ? ' sk-circle' : ''}${onDark ? ' sk-on-dark' : ''}${className ? ` ${className}` : ''}`}
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  )
}

/**
 * A stack of text lines. The last line is shortened so it reads as a paragraph
 * rather than a solid block.
 */
export function SkeletonText({
  lines = 3,
  h = 12,
  gap = 8,
  lastWidth = '65%',
  style,
}: {
  lines?: number
  h?: Size
  gap?: number
  lastWidth?: string
  style?: CSSProperties
}) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} h={h} w={i === lines - 1 ? lastWidth : '100%'} />
      ))}
    </span>
  )
}

/** Card placeholder with a 16:9 media area — matches the course/live card shape. */
export function SkeletonCard({ thumb = true, lines = 2 }: { thumb?: boolean; lines?: number }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {thumb && <Skeleton className="sk-thumb" r={0} />}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton w={72} h={16} r="var(--r-pill)" />
        <Skeleton w="85%" h={16} />
        <SkeletonText lines={lines} h={11} gap={7} />
      </div>
    </div>
  )
}

/** Repeats {count} rows inside a card — for lists of people, grades, sessions. */
export function SkeletonRows({
  count = 4,
  avatar = false,
  action = false,
}: {
  count?: number
  avatar?: boolean
  action?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {avatar && <Skeleton w={32} h={32} circle />}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skeleton w={`${58 + ((i * 13) % 30)}%`} h={13} />
            <Skeleton w={`${34 + ((i * 17) % 26)}%`} h={11} />
          </div>
          {action && <Skeleton w={70} h={28} r="var(--r-sm)" />}
        </div>
      ))}
    </div>
  )
}

/** Table placeholder that keeps the real table's column rhythm. */
export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i}>
                <Skeleton w={i === 0 ? 90 : 64} h={10} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  <Skeleton w={c === 0 ? `${62 + ((r * 11) % 28)}%` : `${40 + ((r * 7) % 30)}%`} h={12} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Form placeholder — label/field pairs inside a card, plus a submit row. */
export function SkeletonForm({ fields = 4, maxWidth = 680 }: { fields?: number; maxWidth?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <SkeletonPageHead />
      <div className="card card-pad-lg" style={{ maxWidth }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Array.from({ length: fields }, (_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton w={90 + ((i * 23) % 60)} h={11} />
              <Skeleton h={i === fields - 1 ? 84 : 38} r="var(--r-md)" />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
          <Skeleton w={132} h={36} r="var(--r-md)" />
          <Skeleton w={92} h={36} r="var(--r-md)" />
        </div>
      </div>
    </div>
  )
}

/** Standard page header placeholder (breadcrumb + title). */
export function SkeletonPageHead({ actions = 0 }: { actions?: number }) {
  return (
    <div className="page-head">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton w={110} h={11} />
        <Skeleton w={260} h={30} />
      </div>
      {actions > 0 && (
        <div className="page-head-actions">
          {Array.from({ length: actions }, (_, i) => (
            <Skeleton key={i} w={i === 0 ? 132 : 104} h={36} r="var(--r-md)" />
          ))}
        </div>
      )}
    </div>
  )
}
