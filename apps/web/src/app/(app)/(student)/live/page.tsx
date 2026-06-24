'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Video, Play, Clock, PenTool, Badge } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'
import { RecordingPlayer } from '@/components/live/RecordingPlayer'
import { statusBadge } from '@/components/live/liveUtils'
import { useStudentLiveClasses } from '@/hooks/live/useLiveClasses'
import type { LiveClass } from '@/lib/api/live'

type Recording = typeof MOCK.live.recordings[number]

export default function LiveClassesPage() {
  const router = useRouter()
  const L = MOCK.live
  const [rec, setRec] = useState<Recording | null>(null)

  const { data: liveClasses = [], isLoading } = useStudentLiveClasses()

  const liveNow = liveClasses.find((c: LiveClass) => c.status === 'live')
  const upcoming = liveClasses.filter((c: LiveClass) => c.status === 'scheduled')

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Learn</div>
          <h1 className="h1">Live Classes</h1>
        </div>
      </div>

      {/* Live now hero — only shown for real live classes */}
      {liveNow && (
        <div className="card elev" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
            <div style={{ padding: 32 }}>
              <span className="live-pill-sm" style={{ marginBottom: 16 }}>LIVE NOW</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, margin: '14px 0 8px' }}>
                {liveNow.title}
              </div>
              <div className="muted" style={{ marginBottom: 18 }}>
                {liveNow.course?.title} · with {liveNow.teacher.name}
              </div>
              <button
                className="btn btn-brand btn-lg"
                onClick={() => router.push(`/live/room?classId=${liveNow.id}&role=student`)}
              >
                <Video size={16} /> Join live class
              </button>
            </div>
            <div
              style={{ position: 'relative', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand)' }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,.18), transparent 55%)' }} />
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', position: 'relative', boxShadow: '0 12px 40px rgba(0,0,0,.3)' }}>
                <Play size={30} color="#14130F" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming sessions */}
      {(upcoming.length > 0 || !isLoading) && (
        <>
          <h2 className="h2" style={{ marginBottom: 16 }}>Upcoming sessions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 36 }}>
            {upcoming.length > 0
              ? upcoming.map((u: LiveClass) => (
                <div key={u.id} className="live-card">
                  <div className="live-card-thumb" style={{ background: 'var(--brand)' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, transparent, rgba(0,0,0,.35))' }} />
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>{statusBadge(u.status)}</div>
                    <div style={{ position: 'relative', color: '#fff' }}>
                      {u.scheduled_at && (
                        <div style={{ fontSize: 12, opacity: .85 }}>
                          {new Date(u.scheduled_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>{u.title}</div>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
                      {u.course?.title} · {u.teacher.name}
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      {u.scheduled_at && (
                        <div className="row" style={{ gap: 6, color: 'var(--muted)', fontSize: 12 }}>
                          <Clock size={13} />
                          {new Date(u.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      <button className="btn btn-secondary btn-sm">RSVP</button>
                    </div>
                  </div>
                </div>
              ))
              : L.upcoming.filter(u => u.status !== 'live').map(u => (
                <div key={u.id} className="live-card">
                  <div className={`live-card-thumb ${u.thumb}`}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, transparent, rgba(0,0,0,.35))' }} />
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>{statusBadge(u.status)}</div>
                    <div style={{ position: 'relative', color: '#fff' }}>
                      <div style={{ fontSize: 12, opacity: .85 }}>{u.date}</div>
                    </div>
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>{u.title}</div>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>{u.course} · {u.instructor}</div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <div className="row" style={{ gap: 6, color: 'var(--muted)', fontSize: 12 }}>
                        <Clock size={13} /> {u.when} · {u.duration}
                      </div>
                      <button className="btn btn-secondary btn-sm">RSVP</button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {/* Recordings */}
      <div className="between" style={{ marginBottom: 16 }}>
        <h2 className="h2">Class recordings</h2>
        <span className="muted" style={{ fontSize: 13 }}>Missed a class? Catch up here.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {L.recordings.map(r => (
          <button
            key={r.id}
            className="card"
            style={{ padding: 0, overflow: 'hidden', display: 'flex', textAlign: 'left', cursor: 'pointer', background: 'var(--card)' }}
            onClick={() => setRec(r)}
          >
            <div
              className={r.thumb}
              style={{ width: 180, flexShrink: 0, position: 'relative', display: 'grid', placeItems: 'center' }}
            >
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.9)', display: 'grid', placeItems: 'center' }}>
                <Play size={18} color="#14130F" />
              </div>
              <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4, fontVariantNumeric: 'tabular-nums' }}>
                {r.duration}
              </span>
            </div>
            <div style={{ padding: 16, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>{r.title}</div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>{r.course} · {r.instructor}</div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <Badge>{r.date}</Badge>
                {r.hasWhiteboard && <Badge tone="brand"><PenTool size={11} /> Whiteboard</Badge>}
                <span className="muted" style={{ fontSize: 12 }}>· {r.views} views</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {rec && <RecordingPlayer rec={rec} onClose={() => setRec(null)} />}
    </div>
  )
}
