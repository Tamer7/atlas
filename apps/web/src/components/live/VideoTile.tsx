'use client'
import { VideoTrack } from '@livekit/components-react'
import type { TrackReference } from '@livekit/components-react'
import { Mic, MicOff, VideoOff, Hand } from '@/components/ui'

export interface Participant {
  id: string
  name: string
  role: 'host' | 'student'
  color: string
  cam: boolean
  mic: boolean
  hand: boolean
}

interface VideoTileProps {
  p: Participant
  big?: boolean
  you?: boolean
  trackRef?: TrackReference
}

export function VideoTile({ p, big, you, trackRef }: VideoTileProps) {
  const initials = p.name.split(' ').map(n => n[0]).slice(0, 2).join('')

  return (
    <div
      className={`lr-tile ${p.mic && p.role === 'host' ? 'speaking' : ''}`}
      style={big ? { aspectRatio: 'auto', width: '100%', height: '100%' } : {}}
    >
      {p.cam && trackRef ? (
        <VideoTrack
          trackRef={trackRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : p.cam ? (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(150deg, ${p.color} 0%, #14130F 130%)` }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 35%, rgba(255,255,255,.16), transparent 55%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{
              width: big ? 120 : 56,
              height: big ? 120 : 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.12)',
              border: '2px solid rgba(255,255,255,.25)',
              display: 'grid',
              placeItems: 'center',
              fontSize: big ? 40 : 20,
              fontWeight: 700,
            }}>
              {initials}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="lr-tile-avatar"
          style={{ background: p.color, width: big ? 120 : 64, height: big ? 120 : 64, fontSize: big ? 40 : 22 }}
        >
          {initials}
        </div>
      )}

      <div className="lr-tile-name">
        {p.mic
          ? <Mic size={12} color="#4ADE80" />
          : <MicOff size={12} color="#FF8A8A" />
        }
        {you ? 'You' : p.name.split(' ')[0]}
        {p.role === 'host' && <span style={{ opacity: 0.6 }}>· Host</span>}
      </div>

      {!p.cam && (
        <div className="lr-tile-badge">
          <VideoOff size={13} color="rgba(255,255,255,.7)" />
        </div>
      )}

      {p.hand && (
        <div className="lr-tile-hand">
          <Hand size={15} />
        </div>
      )}
    </div>
  )
}
