'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useTracks,
  AudioTrack,
  VideoTrack,
  useConnectionState,
  useChat,
  isTrackReference,
} from '@livekit/components-react'
import { Track, ConnectionState } from 'livekit-client'
import type { TrackReference } from '@livekit/components-react'
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, Hand, Grid,
  PhoneOff, Square, Dot, PenTool, Users, ChatBubble,
} from '@/components/ui'
import { Whiteboard } from '@/components/live/Whiteboard'
import { VideoTile, type Participant } from '@/components/live/VideoTile'
import { apiClient } from '@/lib/api/client'

interface TokenData {
  token: string
  server_url: string
  room_name: string
  title: string
}

const COLORS = ['#2747E0', '#C24A3A', '#1F7A47', '#6B2E84', '#B47A00', '#0891B2']
const colorFor = (identity: string) =>
  COLORS[identity.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length]

// ─── Outer shell: fetches token then mounts LiveKitRoom ───────────────────────

export function LiveRoomClient() {
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId')
  const role = (searchParams.get('role') ?? 'student') as 'teacher' | 'student'

  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!classId) { setError('No class ID provided.'); return }

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
      <LiveRoomInner role={role} classId={classId!} title={tokenData.title} />
    </LiveKitRoom>
  )
}

// ─── Inner component: uses LiveKit hooks ─────────────────────────────────────

function LiveRoomInner({
  role,
  classId,
  title,
}: {
  role: 'teacher' | 'student'
  classId: string
  title: string
}) {
  const router = useRouter()
  const connectionState = useConnectionState()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useParticipants()
  const cameraTracks = useTracks([Track.Source.Camera])
  const screenTracks = useTracks([Track.Source.ScreenShare])
  const audioTracks = useTracks([Track.Source.Microphone])
  const { chatMessages, send: sendChat } = useChat()

  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const [mode, setMode] = useState<'speaker' | 'grid' | 'whiteboard'>('speaker')
  const [sharing, setSharing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [hand, setHand] = useState(false)
  const [panel, setPanel] = useState<'none' | 'people' | 'chat'>('people')
  const [elapsed, setElapsed] = useState(0)
  const [draft, setDraft] = useState('')
  const chatBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [chatMessages])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Find the active remote screen share (or local one)
  const activeScreenTrack = screenTracks.find(t => isTrackReference(t)) as TrackReference | undefined

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
  }, [localParticipant])

  const stopShare = useCallback(async () => {
    await localParticipant.setScreenShareEnabled(false)
    setSharing(false)
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
    if (role === 'teacher' && recording) await stopRecording()
    router.push(role === 'teacher' ? '/teacher/live' : '/live')
  }, [role, recording, stopRecording, router])

  const toUIParticipant = useCallback(
    (p: typeof localParticipant | typeof remoteParticipants[0], isLocal = false): Participant => ({
      id: p.identity,
      name: p.name ?? p.identity,
      role: role === 'teacher' && isLocal ? 'host' : 'student',
      color: colorFor(p.identity),
      cam: p.isCameraEnabled,
      mic: p.isMicrophoneEnabled,
      hand: false,
    }),
    [role],
  )

  const me = toUIParticipant(localParticipant, true)
  const remotes = remoteParticipants.map(p => toUIParticipant(p))
  const everyone = [me, ...remotes]
  const host = role === 'teacher' ? me : (remotes.find(p => p.role === 'host') ?? everyone[0])

  const cameraTrackFor = (identity: string): TrackReference | undefined => {
    const t = cameraTracks.find(t => t.participant.identity === identity)
    return t && isTrackReference(t) ? t : undefined
  }

  const sendMessage = useCallback(async () => {
    if (!draft.trim()) return
    await sendChat(draft.trim())
    setDraft('')
  }, [draft, sendChat])

  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="lr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>Joining room…</div>
      </div>
    )
  }

  const isScreenSharing = !!activeScreenTrack
  const sharerName = activeScreenTrack
    ? (everyone.find(p => p.id === activeScreenTrack.participant.identity)?.name ?? 'Someone')
    : null

  return (
    <div className="lr">
      {/* Render remote audio tracks (invisible) */}
      {audioTracks
        .filter(t => t.participant.identity !== localParticipant.identity)
        .map(t => isTrackReference(t) && <AudioTrack key={t.participant.identity} trackRef={t as TrackReference} />)
      }

      {/* Top bar */}
      <div className="lr-top">
        <div className="lr-live-pill">LIVE</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>{host.name}</div>
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
            {/* Screen share takes priority over other modes */}
            {isScreenSharing && (
              <>
                <VideoTrack
                  trackRef={activeScreenTrack}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#0F1117' }}
                />
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
                  color: '#fff', fontSize: 12, padding: '4px 10px', borderRadius: 6,
                }}>
                  {activeScreenTrack.participant.identity === localParticipant.identity
                    ? "You're sharing your screen"
                    : `${sharerName} is sharing`}
                </div>
                {/* PiP of host cam while someone shares */}
                <div style={{ position: 'absolute', right: 16, bottom: 16, width: 200, height: 124, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.5)' }}>
                  <VideoTile p={host} big trackRef={cameraTrackFor(host.id)} />
                </div>
              </>
            )}

            {!isScreenSharing && mode === 'whiteboard' && <Whiteboard role={role} />}

            {!isScreenSharing && mode === 'speaker' && (
              <div style={{ position: 'absolute', inset: 12 }}>
                <VideoTile p={host} big trackRef={cameraTrackFor(host.id)} />
              </div>
            )}

            {!isScreenSharing && mode === 'grid' && (
              <div className="lr-grid">
                {everyone.slice(0, 9).map(p => (
                  <VideoTile key={p.id} p={p} you={p.id === me.id} trackRef={cameraTrackFor(p.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Filmstrip (hidden when grid or screen share with single participant) */}
          {mode !== 'grid' && (
            <div className="lr-strip">
              {(mode === 'speaker' || isScreenSharing ? remotes : everyone).slice(0, 7).map(p => (
                <VideoTile key={p.id} p={p} you={p.id === me.id} trackRef={cameraTrackFor(p.id)} />
              ))}
              {everyone.length > 8 && (
                <div className="lr-strip-more" onClick={() => setMode('grid')}>
                  <Grid size={18} />
                  <span>+{everyone.length - 7} more</span>
                </div>
              )}
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
                Chat {chatMessages.length > 0 && `· ${chatMessages.length}`}
              </button>
            </div>

            {panel === 'people' && (
              <div className="lr-panel-body">
                {everyone.map(p => (
                  <div key={p.id} className="lr-people-row">
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: p.color, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
                      {p.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.id === me.id ? 'You' : p.name}</div>
                      {p.role === 'host' && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>Host · Teacher</div>}
                    </div>
                    {p.mic ? <Mic size={15} color="#4ADE80" /> : <MicOff size={15} color="rgba(255,255,255,.35)" />}
                    {p.cam ? <Video size={15} color="rgba(255,255,255,.55)" /> : <VideoOff size={15} color="rgba(255,255,255,.35)" />}
                  </div>
                ))}
              </div>
            )}

            {panel === 'chat' && (
              <>
                <div className="lr-panel-body" ref={chatBodyRef}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13, paddingTop: 40 }}>
                      No messages yet
                    </div>
                  )}
                  {chatMessages.map(m => (
                    <div key={m.id} className="lr-chat-msg">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: colorFor(m.from?.identity ?? ''),
                          display: 'grid', placeItems: 'center',
                          fontSize: 10, fontWeight: 700, flexShrink: 0, color: '#fff',
                        }}>
                          {(m.from?.name ?? m.from?.identity ?? '?').split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <b style={{ fontSize: 12.5 }}>{m.from?.name ?? m.from?.identity ?? 'Unknown'}</b>
                        {m.from?.identity === localParticipant.identity && (
                          <span style={{ fontSize: 10, background: 'rgba(110,138,255,.25)', color: '#9DB2FF', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>You</span>
                        )}
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginLeft: 'auto' }}>
                          {new Date(m.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.82)', lineHeight: 1.45, paddingLeft: 29 }}>{m.message}</div>
                    </div>
                  ))}
                </div>
                <div className="lr-chat-input">
                  <input
                    placeholder="Message the class…"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn btn-brand btn-icon" onClick={sendMessage}>
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

        <button className={`lr-ctrl ${!isScreenSharing && mode === 'whiteboard' ? 'on' : ''}`} onClick={() => setMode(mode === 'whiteboard' ? 'speaker' : 'whiteboard')}>
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
