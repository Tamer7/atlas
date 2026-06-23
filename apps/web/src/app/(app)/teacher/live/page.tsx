'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Broadcast, ArrowRight, Play, Users, PenTool, ChatBubble, Copy, Download } from '@/components/ui'
import { Badge } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'
import { RecordingPlayer } from '@/components/live/RecordingPlayer'
import { ScheduleModal } from '@/components/live/ScheduleModal'

type Recording = typeof MOCK.live.recordings[number]

function statusBadge(s: string) {
  if (s === 'live') return <span className="live-pill-sm">LIVE NOW</span>
  if (s === 'soon') return <Badge tone="warning">Starts soon</Badge>
  return <Badge>Scheduled</Badge>
}

export default function TeacherLivePage() {
  const router = useRouter()
  const L = MOCK.live
  const [rec, setRec] = useState<Recording | null>(null)
  const [scheduling, setScheduling] = useState(false)

  const live = L.upcoming.find(u => u.status === 'live')
  const upcoming = L.upcoming.filter(u => u.status !== 'live')

  const stats = [
    { label: 'Live now', value: '1', sub: 'session running', accent: true },
    { label: 'Scheduled', value: upcoming.length, sub: 'this week' },
    { label: 'Recordings', value: L.recordings.length, sub: 'published' },
    { label: 'Avg. attendance', value: '82%', sub: 'last 30 days' },
  ]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Teach</div>
          <h1 className="h1">Live Classes</h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary" onClick={() => setScheduling(true)}>
            <Calendar size={14} /> Schedule
          </button>
          <button className="btn btn-brand" onClick={() => router.push('/live/room')}>
            <Broadcast size={14} /> Start instant class
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="card card-pad-lg">
            <div className="eyebrow" style={{ marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 34, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.02em', color: s.accent ? 'var(--brand)' : 'var(--ink)' }}>
              {s.value}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live now resume card */}
      {live && (
        <div
          className="card elev"
          style={{ padding: 24, marginBottom: 28, display: 'flex', gap: 20, alignItems: 'center', borderColor: '#F3C6C0', background: 'color-mix(in srgb, var(--danger-tint) 18%, white)' }}
        >
          <div
            className={live.thumb}
            style={{ width: 120, height: 76, borderRadius: 'var(--r-md)', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <Broadcast size={26} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <span className="live-pill-sm" style={{ marginBottom: 8 }}>LIVE NOW · REC</span>
            <div style={{ fontWeight: 600, fontSize: 18, margin: '8px 0 4px' }}>{live.title}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {live.attending} students in the room · recording in progress · started {L.liveNow.startedAgo}
            </div>
          </div>
          <button className="btn btn-brand btn-lg" onClick={() => router.push('/live/room')}>
            <ArrowRight size={16} /> Rejoin class
          </button>
        </div>
      )}

      {/* Scheduled list */}
      <h2 className="h2" style={{ marginBottom: 16 }}>Scheduled</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 36 }}>
        {upcoming.map((u, i) => (
          <div
            key={u.id}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < upcoming.length - 1 ? '1px solid var(--line)' : '0' }}
          >
            <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {u.date.split(' ')[0]}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{u.date.split(' ')[1] || ''}</div>
            </div>
            <div className={u.thumb} style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{u.title}</div>
              <div className="muted" style={{ fontSize: 12 }}>{u.course} · {u.when} · {u.duration}</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              {statusBadge(u.status)}
              <Badge><Users size={11} /> {u.rsvp} RSVP</Badge>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn btn-ghost btn-sm">Edit</button>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/live/room')}>Start</button>
            </div>
          </div>
        ))}
      </div>

      {/* Recordings table */}
      <div className="between" style={{ marginBottom: 16 }}>
        <h2 className="h2">Your recordings</h2>
        <span className="muted" style={{ fontSize: 13 }}>Auto-published to each course</span>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Course</th>
              <th>Date</th>
              <th>Length</th>
              <th>Views</th>
              <th>Includes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {L.recordings.map(r => (
              <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setRec(r)}>
                <td>
                  <div className="row" style={{ gap: 12 }}>
                    <div
                      className={r.thumb}
                      style={{ width: 48, height: 30, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center' }}
                    >
                      <Play size={12} color="#fff" />
                    </div>
                    <b>{r.title}</b>
                  </div>
                </td>
                <td className="muted">{r.course}</td>
                <td className="muted">{r.date}</td>
                <td className="num mono">{r.duration}</td>
                <td className="num">{r.views}</td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    {r.hasWhiteboard && <Badge tone="brand"><PenTool size={10} /></Badge>}
                    {r.hasChat && <Badge><ChatBubble size={10} /></Badge>}
                  </div>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Copy link"><Copy size={13} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Download"><Download size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rec && <RecordingPlayer rec={rec} onClose={() => setRec(null)} />}
      {scheduling && <ScheduleModal onClose={() => setScheduling(false)} />}
    </div>
  )
}
