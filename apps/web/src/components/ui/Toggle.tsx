'use client'
import { useState } from 'react'
export function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button onClick={() => setOn(!on)} style={{
      width: 36, height: 20, borderRadius: 99,
      background: on ? 'var(--brand)' : 'var(--line-2)',
      border: 0, cursor: 'pointer', position: 'relative', transition: 'background .15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 16, height: 16, background: '#fff', borderRadius: '50%',
        transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      }} />
    </button>
  )
}
