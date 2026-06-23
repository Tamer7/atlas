'use client'
import { useMemo } from 'react'

type Pair = { l: string; r: string }
type MatchValue = Record<string, number>

export function MatchPairs({
  pairs,
  value = {},
  onChange,
}: {
  pairs: readonly Pair[]
  value?: MatchValue
  onChange: (val: MatchValue) => void
}) {
  const shuffled = useMemo(
    () => [...pairs].map((p, i) => ({ ...p, _i: i })).sort((a, b) => a.r.length - b.r.length),
    [pairs],
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pairs.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '12px 14px',
              border: '1px solid var(--line-2)',
              background: 'var(--card)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div className="letter" style={{ width: 22, height: 22, fontSize: 11 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, fontSize: 14 }}>{p.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shuffled.map((p, i) => {
          const matchedTo = Object.entries(value).find(([, v]) => v === p._i)?.[0]
          return (
            <select
              key={i}
              value={matchedTo ?? ''}
              onChange={e => {
                const newVal = { ...value }
                Object.keys(newVal).forEach(k => {
                  if (newVal[k] === p._i) delete newVal[k]
                })
                if (e.target.value !== '') newVal[e.target.value] = p._i
                onChange(newVal)
              }}
              className="select"
              style={{ height: 46, fontSize: 14 }}
            >
              <option value="">— matches with —</option>
              {pairs.map((_, li) => (
                <option key={li} value={li}>
                  {li + 1}. {pairs[li].l.slice(0, 50)}
                  {pairs[li].l.length > 50 ? '…' : ''}
                </option>
              ))}
            </select>
          )
        })}
        <div style={{ marginTop: 6 }}>
          {shuffled.map((p, i) => (
            <div
              key={i}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                color: 'var(--ink-2)',
                borderLeft: '2px solid var(--line-2)',
                marginLeft: 10,
                marginTop: 4,
              }}
            >
              <span
                className="muted"
                style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginRight: 6 }}
              >
                {String.fromCharCode(65 + i)}.
              </span>
              {p.r}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
