'use client'
import React, { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Flag, MoreH, Play, Pause, CC, Volume, Maximize,
  Check, Circle, ListChecks, ArrowLeft, ArrowRight,
  Paperclip, Send, FileText, Layers,
  Tabs, Avatar, Badge,
} from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lid: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [tab, setTab] = useState('transcript')
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(408) // 6:48 (current chapter)
  const [speed, setSpeed] = useState(1)
  const [cc, setCc] = useState(true)

  const duration = 18 * 60 + 5

  useEffect(() => {
    if (!playing) return
    const intervalId = setInterval(() => setT(x => Math.min(duration, x + speed)), 1000)
    return () => clearInterval(intervalId)
  }, [playing, speed])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  const pct = (t / duration) * 100

  const tabs = [
    { id: 'transcript', label: 'Transcript' },
    { id: 'notes', label: 'Notes' },
    { id: 'attachments', label: 'Attachments', count: 4 },
    { id: 'discussion', label: 'Q&A', count: MOCK.discussion.length },
  ]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                router.push(`/courses/${id}`)
              }}
            >
              English B2
            </a>{' '}
            · Module 3 · Lesson 15
          </div>
          <h1 className="h2" style={{ maxWidth: 800 }}>
            Mixed conditionals &amp; nuance
          </h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary">
            <Flag size={14} /> Mark issue
          </button>
          <button className="btn btn-secondary btn-icon">
            <MoreH size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div>
          {/* Video */}
          <div className="video-stage">
            <div className="scrim" />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 44,
                    fontWeight: 600,
                    color: '#fff',
                    opacity: 0.9,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Mixed Conditionals
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#fff',
                    opacity: 0.6,
                    marginTop: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontWeight: 500,
                  }}
                >
                  Pattern 2 · Present condition, past result
                </div>
              </div>
            </div>

            {cc && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 80,
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,.7)',
                  color: '#fff',
                  padding: '6px 14px',
                  fontSize: 15,
                  borderRadius: 6,
                  maxWidth: '70%',
                  textAlign: 'center',
                }}
              >
                &ldquo;If you were more patient, you would have caught the mistake earlier.&rdquo;
              </div>
            )}

            {!playing && (
              <button
                onClick={() => setPlaying(true)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'transparent',
                  border: 0,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.95)',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 12px 36px rgba(0,0,0,.4)',
                  }}
                >
                  <Play size={28} color="#0B0A07" />
                </div>
              </button>
            )}

            <div className="video-controls">
              <button className="video-btn" onClick={() => setPlaying(p => !p)}>
                {playing ? <Pause size={16} /> : <Play size={14} fill="#fff" />}
              </button>
              <span className="video-time">{fmt(t)}</span>
              <div
                className="scrub"
                onClick={e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  setT(Math.round(((e.clientX - r.left) / r.width) * duration))
                }}
              >
                <div className="scrub-fill" style={{ width: `${pct}%` }} />
                <div className="scrub-thumb" style={{ left: `${pct}%` }} />
              </div>
              <span className="video-time">{fmt(duration)}</span>
              <button
                className="video-btn"
                onClick={() =>
                  setSpeed(s => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : s === 1.5 ? 2 : 1))
                }
                style={{ width: 'auto', padding: '0 6px', fontSize: 12, fontWeight: 600 }}
              >
                {speed}&times;
              </button>
              <button
                className="video-btn"
                onClick={() => setCc(v => !v)}
                title="Captions"
                style={{ opacity: cc ? 1 : 0.5 }}
              >
                <CC size={16} />
              </button>
              <button className="video-btn">
                <Volume size={16} />
              </button>
              <button className="video-btn">
                <Maximize size={14} />
              </button>
            </div>
          </div>

          {/* Lesson controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              marginBottom: 24,
            }}
          >
            <button className="btn btn-secondary">
              <ArrowLeft size={14} /> Previous · Second conditional
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/quiz/q1')}
            >
              Next · Conditional quiz <ArrowRight size={14} />
            </button>
          </div>

          {/* Tabbed content */}
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div style={{ padding: '24px 0' }}>
            {tab === 'transcript' && (
              <div>
                <div className="row" style={{ marginBottom: 16 }}>
                  <input
                    className="input"
                    placeholder="Search transcript…"
                    style={{ maxWidth: 320 }}
                  />
                  <button className="btn btn-ghost btn-sm">Auto-scroll · On</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {MOCK.transcript.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 16,
                        padding: i === 1 ? 12 : 0,
                        background: i === 1 ? 'var(--brand-tint)' : 'transparent',
                        borderRadius: 'var(--r-md)',
                        marginLeft: i === 1 ? -12 : 0,
                        marginRight: i === 1 ? -12 : 0,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 56,
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          fontWeight: 600,
                          paddingTop: 2,
                        }}
                      >
                        {line.t}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 4,
                          }}
                        >
                          {line.speaker}
                        </div>
                        <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                          {line.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'notes' && (
              <div>
                <textarea
                  className="textarea"
                  rows={8}
                  placeholder="Take notes here. They sync to your lessons."
                  defaultValue={
                    '• Mixed conditional = past condition + present result OR present condition + past result\n• Pattern 1: If I had + past participle, I would + be \n• Lena\'s example: "If she had taken that job, she would be living in Lisbon right now."\n• Watch for: time markers (now, today, currently) signal mixing\n'
                  }
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <div className="muted" style={{ fontSize: 12 }}>
                    Saved 2 minutes ago · Private to you
                  </div>
                  <button className="btn btn-secondary btn-sm">Export as PDF</button>
                </div>
              </div>
            )}

            {tab === 'attachments' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { name: 'Mixed conditionals — cheat sheet', size: 'PDF · 280 KB', Icon: FileText },
                  { name: '20 native-speaker examples', size: 'Audio · 12 min', Icon: Volume },
                  { name: 'Practice workbook', size: 'PDF · 1.2 MB', Icon: FileText },
                  { name: 'Slide deck', size: 'PDF · 4.1 MB', Icon: Layers },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="card card-pad"
                    style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        background: 'var(--paper-2)',
                        borderRadius: 'var(--r-md)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <f.Icon size={18} color="var(--brand)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{f.size}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm">Download</button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'discussion' && (
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <Avatar name={MOCK.user.name} color={MOCK.user.color} />
                  <div style={{ flex: 1 }}>
                    <textarea
                      className="textarea"
                      placeholder="Ask a question or share an example..."
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      <button className="btn btn-ghost btn-sm">
                        <Paperclip size={12} /> Attach
                      </button>
                      <button className="btn btn-primary btn-sm">
                        <Send size={12} /> Post
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {MOCK.discussion.map(d => {
                    const isInstructor = 'instructor' in d && !!d.instructor
                    return (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex',
                          gap: 12,
                          padding: 14,
                          background: isInstructor
                            ? 'var(--brand-tint)'
                            : 'var(--paper-2)',
                          borderRadius: 'var(--r-md)',
                        }}
                      >
                        <Avatar name={d.who} color={d.color} />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <b style={{ fontSize: 13 }}>{d.who}</b>
                            {isInstructor && <Badge tone="brand">Instructor</Badge>}
                            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                              · {d.time}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{d.text}</div>
                          {d.replies > 0 && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: 0, marginTop: 8 }}
                            >
                              {d.replies} replies
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right rail — chapters */}
        <div>
          <div className="card" style={{ padding: 14 }}>
            <div className="between" style={{ marginBottom: 10, padding: '0 4px' }}>
              <div className="eyebrow">Chapters</div>
              <div className="muted" style={{ fontSize: 11 }}>
                {MOCK.chapters.filter(c => 'done' in c && !!c.done).length}/{MOCK.chapters.length}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {MOCK.chapters.map(ch => {
                const isDone = 'done' in ch && !!ch.done
                const isCurrent = 'current' in ch && !!ch.current
                let icon: React.ReactNode
                if (isDone) {
                  icon = <Check size={12} color="var(--success)" />
                } else if (isCurrent) {
                  icon = <Play size={10} fill="currentColor" />
                } else {
                  icon = <Circle size={10} color="var(--faint)" />
                }
                return (
                  <button
                    key={ch.id}
                    className={`chapter${isCurrent ? ' active' : ''}${isDone ? ' done' : ''}`}
                    style={{ border: 0, width: '100%', textAlign: 'left' }}
                    onClick={() => setT(ch.t)}
                  >
                    <div className="chap-num">{String(ch.n).padStart(2, '0')}</div>
                    <div style={{ width: 16, display: 'grid', placeItems: 'center' }}>
                      {icon}
                    </div>
                    <div className="chap-title">{ch.title}</div>
                    <div className="chap-time">{ch.time}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card card-pad" style={{ marginTop: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Up next in this lesson
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--accent-tint)',
                  color: '#8B4426',
                  borderRadius: 'var(--r-md)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <ListChecks size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  Conditionals practice quiz
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  5 questions · ~10 min
                </div>
              </div>
            </div>
            <button
              className="btn btn-brand btn-sm btn-block"
              style={{ marginTop: 12 }}
              onClick={() => router.push('/quiz/q1')}
            >
              Start quiz <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
