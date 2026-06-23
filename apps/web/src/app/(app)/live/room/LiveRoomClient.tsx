'use client'
// This page renders outside the (app) scrollable main by using position:fixed via CSS class .lr
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, Hand, Grid,
  PhoneOff, Square, Dot, PenTool, Users, ChatBubble,
} from '@/components/ui'
import { MOCK } from '@/lib/mock-data'
import { Whiteboard } from '@/components/live/Whiteboard'
import { VideoTile, type Participant } from '@/components/live/VideoTile'

export function LiveRoomClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') ?? 'student') as 'teacher' | 'student'

  const L = MOCK.live
  const host = L.participants[0] as Participant
  const others = L.participants.slice(1) as Participant[]

  const me: Participant = role === 'teacher'
    ? (L.participants[0] as Participant)
    : { id: 'me', name: 'Sofia Chen', role: 'student', color: '#2747E0', cam: true, mic: false, hand: false }

  const everyone: Participant[] = role === 'teacher'
    ? (L.participants as unknown as Participant[])
    : [{ ...me }, ...(L.participants as unknown as Participant[])]

  const [mic, setMic] = useState(role === 'teacher')
  const [cam, setCam] = useState(true)
  const [mode, setMode] = useState<'speaker' | 'grid' | 'whiteboard' | 'screen'>('speaker')
  const [sharing, setSharing] = useState(false)
  const [recording, setRecording] = useState(role === 'teacher')
  const [hand, setHand] = useState(false)
  const [panel, setPanel] = useState<'none' | 'people' | 'chat'>('people')
  const [elapsed, setElapsed] = useState(12 * 60 + 4)
  const [chat, setChat] = useState([...L.chat] as Array<{
    id: string | number; who: string; role: 'host' | 'student'; color: string; time: string; text: string
  }>)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const startShare = () => { setSharing(true); setMode('screen') }
  const stopShare = () => { setSharing(false); setMode('speaker') }

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

  return (
    <div className="lr">
      {/* Top bar */}
      <div className="lr-top">
        <div className="lr-live-pill">LIVE</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {L.liveNow.title}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>
            {L.liveNow.course} · {host.name}
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
              <div style={{ position: 'absolute', inset: 0, background: '#0F1117' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: 48, background: 'linear-gradient(135deg, #1a1d29, #0F1117)' }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>
                    {role === 'teacher' ? "You're sharing your screen" : `${host.name} is sharing`}
                  </div>
                  <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 20, maxWidth: 720 }}>
                    The two patterns of mixed conditionals
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
                    {['Past condition → present result', 'Present condition → past result'].map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 18, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: i === 0 ? '#2747E0' : '#1F7A47', display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0, color: '#fff' }}>{i + 1}</div>
                        <div style={{ fontSize: 20, fontWeight: 500 }}>{t}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 'auto', fontSize: 14, color: 'rgba(255,255,255,.4)' }}>Atlas · English B2 · Live Workshop</div>
                </div>
                <div style={{ position: 'absolute', right: 16, bottom: 16, width: 200, height: 124 }}>
                  <VideoTile p={host} big />
                </div>
              </div>
            )}

            {mode === 'speaker' && (
              <div style={{ position: 'absolute', inset: 12 }}>
                <VideoTile p={host} big />
              </div>
            )}

            {mode === 'grid' && (
              <div className="lr-grid">
                {everyone.slice(0, 9).map(p => (
                  <VideoTile key={p.id} p={p} you={p.id === me.id} />
                ))}
              </div>
            )}
          </div>

          {/* Filmstrip (hidden in grid mode) */}
          {mode !== 'grid' && (
            <div className="lr-strip">
              {(mode === 'speaker' ? others : everyone).slice(0, 7).map(p => (
                <VideoTile key={p.id} p={p} you={p.id === me.id} />
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
              <button
                className={`lr-panel-tab ${panel === 'people' ? 'active' : ''}`}
                onClick={() => setPanel('people')}
              >
                People · {everyone.length}
              </button>
              <button
                className={`lr-panel-tab ${panel === 'chat' ? 'active' : ''}`}
                onClick={() => setPanel('chat')}
              >
                Chat
              </button>
            </div>

            {panel === 'people' && (
              <div className="lr-panel-body">
                {role === 'teacher' && (
                  <button
                    className="btn btn-secondary btn-sm btn-block"
                    style={{ marginBottom: 12, background: '#26262E', color: '#fff', borderColor: 'rgba(255,255,255,.1)' }}
                  >
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
                          <span style={{ fontSize: 10, background: 'rgba(110,138,255,.25)', color: '#9DB2FF', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>
                            Host
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginLeft: 'auto' }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.82)', lineHeight: 1.45, paddingLeft: 29 }}>
                        {m.text}
                      </div>
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
        <button className={`lr-ctrl ${mic ? '' : 'off'}`} onClick={() => setMic(!mic)}>
          <div className="ic">{mic ? <Mic size={20} /> : <MicOff size={20} />}</div>
          <span>{mic ? 'Mute' : 'Unmute'}</span>
        </button>
        <button className={`lr-ctrl ${cam ? '' : 'off'}`} onClick={() => setCam(!cam)}>
          <div className="ic">{cam ? <Video size={20} /> : <VideoOff size={20} />}</div>
          <span>{cam ? 'Stop video' : 'Start video'}</span>
        </button>

        <div style={{ width: 1, height: 38, background: 'rgba(255,255,255,.1)', margin: '0 4px' }} />

        <button className={`lr-ctrl ${sharing ? 'on' : ''}`} onClick={() => sharing ? stopShare() : startShare()}>
          <div className="ic"><ScreenShare size={20} /></div>
          <span>{sharing ? 'Stop share' : 'Share screen'}</span>
        </button>
        <button
          className={`lr-ctrl ${mode === 'whiteboard' ? 'on' : ''}`}
          onClick={() => setMode(mode === 'whiteboard' ? 'speaker' : 'whiteboard')}
        >
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
          <button className={`lr-ctrl ${recording ? 'live-rec' : ''}`} onClick={() => setRecording(!recording)}>
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

        <button className="lr-leave" onClick={() => router.push('/live')}>
          <PhoneOff size={16} /> {role === 'teacher' ? 'End class' : 'Leave'}
        </button>
      </div>
    </div>
  )
}
