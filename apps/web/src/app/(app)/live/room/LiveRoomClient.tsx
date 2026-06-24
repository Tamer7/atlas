'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useTracks,
  AudioTrack,
  useConnectionState,
  isTrackReference,
} from '@livekit/components-react'
import { Track, ConnectionState } from 'livekit-client'
import type { TrackReference } from '@livekit/components-react'
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, Hand, Grid,
  PhoneOff, Square, Dot, PenTool, Users, ChatBubble,
} from '@/components/ui'
import { MOCK } from '@/lib/mock-data'
import { Whiteboard } from '@/components/live/Whiteboard'
import { VideoTile, type Participant } from '@/components/live/VideoTile'
import { apiClient } from '@/lib/api/client'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TokenData {
  token: string
  server_url: string
  room_name: string
}

// ─── Outer shell: fetches token then mounts LiveKitRoom ───────────────────────

export function LiveRoomClient() {
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId')
  const role = (searchParams.get('role') ?? 'student') as 'teacher' | 'student'

  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!classId) {
      setError('No class ID provided.')
      return
    }

    apiClient.post(`/api/v1/live-classes/${classId}/token`)
      .then(res => setTokenData(res.data.data))
      .catch(err => setError(err.response?.data?.message ?? 'Failed to join class.'))
  }, [classId])

  if (error) {
    return (
      <div className="lr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ color: 'var(--danger)', fontSize: 16 }}>{error}</div>
      </div>
    )
  }

  if (!tokenData) {
    return (
      <div className="lr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>Connecting…</div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      serverUrl={tokenData.server_url}
      token={tokenData.token}
      connect
      audio
      video
      style={{ display: 'contents' }}
    >
      <LiveRoomInner role={role} classId={classId!} />
    </LiveKitRoom>
  )
}

// ─── Inner component: uses LiveKit hooks ─────────────────────────────────────

function LiveRoomInner({ role, classId }: { role: 'teacher' | 'student'; classId: string }) {
  const router = useRouter()
  const connectionState = useConnectionState()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useParticipants()
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])
  const audioTracks = useTracks([Track.Source.Microphone])

  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const [mode, setMode] = useState<'speaker' | 'grid' | 'whiteboard' | 'screen'>('speaker')
  const [sharing, setSharing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [hand, setHand] = useState(false)
  const [panel, setPanel] = useState<'none' | 'people' | 'chat'>('people')
  const [elapsed, setElapsed] = useState(0)
  const [chat, setChat] = useState([...MOCK.live.chat] as Array<{
    id: string | number; who: string; role: 'host' | 'student'; color: string; time: string; text: string
  }>)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const intervalId = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(intervalId)
  }, [])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Sync mic/cam state with LiveKit
  const toggleMic = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!mic)
    setMic(v => !v)
  }, [localParticipant, mic])

  const toggleCam = useCallback(async () => {
    await localParticipant.setCameraEnabled(!cam)
    setCam(v => !v)
  }, [localParticipant, cam])

  const startShare = useCallback(async () => {
    await localParticipant.setScreenShareEnabled(true)
    setSharing(true)
    setMode('screen')
  }, [localParticipant])

  const stopShare = useCallback(async () => {
    await localParticipant.setScreenShareEnabled(false)
    setSharing(false)
    setMode('speaker')
  }, [localParticipant])

  const startRecording = useCallback(async () => {
    await apiClient.post(`/api/v1/live-classes/${classId}/start`)
    setRecording(true)
  }, [classId])

  const stopRecording = useCallback(async () => {
    await apiClient.post(`/api/v1/live-classes/${classId}/end`)
    setRecording(false)
  }, [classId])

  const leaveRoom = useCallback(async () => {
    if (role === 'teacher' && recording) {
      await stopRecording()
    }
    // Navigate away — LiveKitRoom unmounts and disconnects automatically
    router.push(role === 'teacher' ? '/teacher/live' : '/live')
  }, [role, recording, stopRecording, router])

  // Map LiveKit participants to our UI Participant type
  const toUIParticipant = (p: typeof localParticipant | typeof remoteParticipants[0], isLocal = false): Participant => ({
    id: p.identity,
    name: p.name ?? p.identity,
    role: role === 'teacher' && isLocal ? 'host' : 'student',
    color: '#2747E0',
    cam: p.isCameraEnabled,
    mic: p.isMicrophoneEnabled,
    hand: false,
  })

  const me = toUIParticipant(localParticipant, true)
  const remotes = remoteParticipants.map(p => toUIParticipant(p))
  const everyone = [me, ...remotes]
  const host = role === 'teacher' ? me : (remotes.find(p => p.role === 'host') ?? everyone[0])

  // Find video track ref for a participant identity (only return real tracks, not placeholders)
  const trackRefFor = (identity: string): TrackReference | undefined => {
    const t = tracks.find(t => t.participant.identity === identity)
    return t && isTrackReference(t) ? t : undefined
  }

  const send = () => {
    if (!draft.trim()) return
    setChat(c => [...c, {
      id: Date.now(),
      who: me.name,
      role: me.role,
      color: me.color,
      time: fmt(elapsed),
      text: draft.trim(),
    }])
    setDraft('')
  }

  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="lr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>Joining room…</div>
      </div>
    )
  }

  return (
    <div className="lr">
      {/* Render remote audio tracks (invisible) */}
      {audioTracks
        .filter(t => t.participant.identity !== localParticipant.identity)
        .map(t => <AudioTrack key={t.participant.identity} trackRef={t} />)
      }

      {/* Top bar */}
      <div className="lr-top">
        <div className="lr-live-pill">LIVE</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {MOCK.live.liveNow.title}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>
            {host.name}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {recording && (
          <div className="lr-rec">
            <span className="rec-dot" /> REC · {fmt(elapsed)}
          </div>
        )}
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,.12)' }} />
        <div className="lr-rec"><Users size={15} /> {everyone.length}</div>
        <div className="lr-rec"><span style={{ fontSize: 12 }}>{fmt(elapsed)}</span></div>
      </div>

      {/* Body */}
      <div className={`lr-body ${panel !== 'none' ? 'with-panel' : ''}`}>
        <div className="lr-stage">
          <div className="lr-main">
            {mode === 'whiteboard' && <Whiteboard role={role} />}

            {mode === 'screen' && (
              <div style={{ position: 'absolute', inset: 0, background: '#0F1117', display: 'grid', placeItems: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                  {role === 'teacher' ? "You're sharing your screen" : `${host.name} is sharing`}
                </div>
                <div style={{ position: 'absolute', right: 16, bottom: 16, width: 200, height: 124 }}>
                  <VideoTile p={host} big trackRef={trackRefFor(host.id)} />
                </div>
              </div>
            )}

            {mode === 'speaker' && (
              <div style={{ position: 'absolute', inset: 12 }}>
                <VideoTile p={host} big trackRef={trackRefFor(host.id)} />
              </div>
            )}

            {mode === 'grid' && (
              <div className="lr-grid">
                {everyone.slice(0, 9).map(p => (
                  <VideoTile key={p.id} p={p} you={p.id === me.id} trackRef={trackRefFor(p.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Filmstrip */}
          {mode !== 'grid' && (
            <div className="lr-strip">
              {(mode === 'speaker' ? remotes : everyone).slice(0, 7).map(p => (
                <VideoTile key={p.id} p={p} you={p.id === me.id} trackRef={trackRefFor(p.id)} />
              ))}
              <div className="lr-strip-more" onClick={() => setMode('grid')}>
                <Grid size={18} />
                <span>+{Math.max(0, everyone.length - 7)} more</span>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {panel !== 'none' && (
          <div className="lr-panel">
            <div className="lr-panel-tabs">
              <button className={`lr-panel-tab ${panel === 'people' ? 'active' : ''}`} onClick={() => setPanel('people')}>
                People · {everyone.length}
              </button>
              <button className={`lr-panel-tab ${panel === 'chat' ? 'active' : ''}`} onClick={() => setPanel('chat')}>
                Chat
              </button>
            </div>

            {panel === 'people' && (
              <div className="lr-panel-body">
                {role === 'teacher' && (
                  <button className="btn btn-secondary btn-sm btn-block" style={{ marginBottom: 12, background: '#26262E', color: '#fff', borderColor: 'rgba(255,255,255,.1)' }}>
                    <MicOff size={13} /> Mute all students
                  </button>
                )}
                {everyone.map(p => (
                  <div key={p.id} className="lr-people-row">
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: p.color, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
                      {p.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.id === me.id ? 'You' : p.name}</div>
                      {p.role === 'host' && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>Host · Teacher</div>}
                    </div>
                    {p.hand && <Hand size={15} color="#F5B301" />}
                    {p.mic ? <Mic size={15} color="#4ADE80" /> : <MicOff size={15} color="rgba(255,255,255,.35)" />}
                    {p.cam ? <Video size={15} color="rgba(255,255,255,.55)" /> : <VideoOff size={15} color="rgba(255,255,255,.35)" />}
                  </div>
                ))}
              </div>
            )}

            {panel === 'chat' && (
              <>
                <div className="lr-panel-body">
                  {chat.map(m => (
                    <div key={m.id} className="lr-chat-msg">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.color, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
                          {m.who.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <b style={{ fontSize: 12.5 }}>{m.who}</b>
                        {m.role === 'host' && (
                          <span style={{ fontSize: 10, background: 'rgba(110,138,255,.25)', color: '#9DB2FF', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>Host</span>
                        )}
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginLeft: 'auto' }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.82)', lineHeight: 1.45, paddingLeft: 29 }}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="lr-chat-input">
                  <input
                    placeholder="Message the class…"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                  />
                  <button className="btn btn-brand btn-icon" onClick={send}>
                    <span style={{ fontSize: 14 }}>↑</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="lr-controls">
        <button className={`lr-ctrl ${mic ? '' : 'off'}`} onClick={toggleMic}>
          <div className="ic">{mic ? <Mic size={20} /> : <MicOff size={20} />}</div>
          <span>{mic ? 'Mute' : 'Unmute'}</span>
        </button>
        <button className={`lr-ctrl ${cam ? '' : 'off'}`} onClick={toggleCam}>
          <div className="ic">{cam ? <Video size={20} /> : <VideoOff size={20} />}</div>
          <span>{cam ? 'Stop video' : 'Start video'}</span>
        </button>

        <div style={{ width: 1, height: 38, background: 'rgba(255,255,255,.1)', margin: '0 4px' }} />

        <button className={`lr-ctrl ${sharing ? 'on' : ''}`} onClick={() => sharing ? stopShare() : startShare()}>
          <div className="ic"><ScreenShare size={20} /></div>
          <span>{sharing ? 'Stop share' : 'Share screen'}</span>
        </button>
        <button className={`lr-ctrl ${mode === 'whiteboard' ? 'on' : ''}`} onClick={() => setMode(mode === 'whiteboard' ? 'speaker' : 'whiteboard')}>
          <div className="ic"><PenTool size={20} /></div>
          <span>Whiteboard</span>
        </button>

        {role === 'student' && (
          <button className={`lr-ctrl ${hand ? 'on' : ''}`} onClick={() => setHand(!hand)}>
            <div className="ic"><Hand size={20} /></div>
            <span>{hand ? 'Lower hand' : 'Raise hand'}</span>
          </button>
        )}

        {role === 'teacher' && (
          <button className={`lr-ctrl ${recording ? 'live-rec' : ''}`} onClick={() => recording ? stopRecording() : startRecording()}>
            <div className="ic">{recording ? <Square size={16} /> : <Dot size={20} />}</div>
            <span>{recording ? 'Stop rec' : 'Record'}</span>
          </button>
        )}

        <div style={{ width: 1, height: 38, background: 'rgba(255,255,255,.1)', margin: '0 4px' }} />

        <button className={`lr-ctrl ${panel === 'people' ? 'on' : ''}`} onClick={() => setPanel(panel === 'people' ? 'none' : 'people')}>
          <div className="ic"><Users size={20} /></div>
          <span>People</span>
        </button>
        <button className={`lr-ctrl ${panel === 'chat' ? 'on' : ''}`} onClick={() => setPanel(panel === 'chat' ? 'none' : 'chat')}>
          <div className="ic"><ChatBubble size={20} /></div>
          <span>Chat</span>
        </button>
        <button className="lr-ctrl" onClick={() => setMode(mode === 'grid' ? 'speaker' : 'grid')}>
          <div className="ic"><Grid size={20} /></div>
          <span>{mode === 'grid' ? 'Speaker' : 'Grid'}</span>
        </button>

        <button className="lr-leave" onClick={leaveRoom}>
          <PhoneOff size={16} /> {role === 'teacher' ? 'End class' : 'Leave'}
        </button>
      </div>
    </div>
  )
}
