'use client'
import { useRouter } from 'next/navigation'
import { Video, Play, Clock } from '@/components/ui'
import { statusBadge } from '@/components/live/liveUtils'
import { useStudentLiveClasses } from '@/hooks/live/useLiveClasses'
import type { LiveClass } from '@/lib/api/live'

export default function LiveClassesPage() {
  const router = useRouter()
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

      {liveNow && (
        <div className="card elev" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
            <div style={{ padding: 32 }}>
              <span className="live-pill-sm" style={{ marginBottom: 16 }}>LIVE NOW</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, margin: '14px 0 8px' }}>
                {liveNow.title}
              </div>
              <div className="muted" style={{ marginBottom: 18 }}>
                {liveNow.course?.title}{liveNow.teacher?.name ? ` · with ${liveNow.teacher.name}` : ''}
              </div>
              <button className="btn btn-brand btn-lg" onClick={() => router.push(`/live/room?classId=${liveNow.id}`)}>
                <Video size={16} /> Join live class
              </button>
            </div>
            <div style={{ position: 'relative', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,.18), transparent 55%)' }} />
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', position: 'relative', boxShadow: '0 12px 40px rgba(0,0,0,.3)' }}>
                <Play size={30} color="#14130F" />
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="h2" style={{ marginBottom: 16 }}>Upcoming sessions</h2>
      {isLoading ? (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
      ) : upcoming.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No upcoming sessions</div>
          <div className="muted" style={{ fontSize: 13 }}>Your teacher will schedule live classes that appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {upcoming.map((u: LiveClass) => (
            <div key={u.id} className="live-card">
              <div className="live-card-thumb" style={{ background: 'var(--brand)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, transparent, rgba(0,0,0,.35))' }} />
                <div style={{ position: 'absolute', top: 12, left: 12 }}>{statusBadge(u.status)}</div>
                {u.scheduled_at && (
                  <div style={{ position: 'relative', color: '#fff', fontSize: 12, opacity: .85 }}>
                    {new Date(u.scheduled_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>{u.title}</div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
                  {u.course?.title}{u.teacher?.name ? ` · ${u.teacher.name}` : ''}
                </div>
                {u.scheduled_at && (
                  <div className="row" style={{ gap: 6, color: 'var(--muted)', fontSize: 12 }}>
                    <Clock size={13} />
                    {new Date(u.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
