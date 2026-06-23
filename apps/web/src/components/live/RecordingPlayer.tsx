'use client'
import { useEffect, useState } from 'react'
import { Play, Pause, CC, Maximize, Broadcast, X } from '@/components/ui'

type Recording = {
  id: string
  title: string
  course: string
  instructor: string
  date: string
  duration: string
  hasWhiteboard: boolean
  hasChat: boolean
}

function parseDuration(d: string): number {
  const p = d.split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]
}

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(sec).padStart(2, '0')
}

export function RecordingPlayer({ rec, onClose }: { rec: Recording; onClose: () => void }) {
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(0)
  const dur = parseDuration(rec.duration)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setT(x => Math.min(dur, x + 1)), 250)
    return () => clearInterval(id)
  }, [playing, dur])

  const pct = (t / dur) * 100

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,10,.8)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(1040px, 96vw)', background: '#101015', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--sh-pop)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.08)', color: '#fff' }}>
          <Broadcast size={16} color="#FF8A8A" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{rec.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{rec.course} · {rec.instructor} · Recorded {rec.date}</div>
          </div>
          <button className="btn btn-ghost btn-icon" style={{ color: '#fff' }} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Stage */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0F1117' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: 48, background: 'linear-gradient(135deg, #1a1d29, #0F1117)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
              Recording · Whiteboard segment
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', marginBottom: 16 }}>
              {rec.title.split('—')[0].trim()}
            </div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 16, maxWidth: 560 }}>
              Playback includes the shared whiteboard{rec.hasChat ? ' and class chat' : ''} captured during the live session.
            </div>
          </div>

          {!playing && (
            <button
              onClick={() => setPlaying(true)}
              style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.25)', border: 0, cursor: 'pointer' }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.95)', display: 'grid', placeItems: 'center' }}>
                <Play size={26} color="#0B0A07" />
              </div>
            </button>
          )}

          {/* Controls bar */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,.75))', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setPlaying(!playing)}
              style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
            >
              {playing ? <Pause size={20} /> : <Play size={18} />}
            </button>
            <span style={{ color: '#fff', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(t)}</span>
            <div
              style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.2)', borderRadius: 99, position: 'relative', cursor: 'pointer' }}
              onClick={e => {
                const r = e.currentTarget.getBoundingClientRect()
                setT(Math.round(((e.clientX - r.left) / r.width) * dur))
              }}
            >
              <div style={{ width: `${pct}%`, height: '100%', background: '#FF3B3B', borderRadius: 99 }} />
              {[18, 44, 67].map(m => (
                <div key={m} style={{ position: 'absolute', left: `${m}%`, top: -3, width: 2, height: 10, background: 'rgba(255,255,255,.6)' }} />
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{rec.duration}</span>
            <button style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer' }}><CC size={18} /></button>
            <button style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer' }}><Maximize size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
