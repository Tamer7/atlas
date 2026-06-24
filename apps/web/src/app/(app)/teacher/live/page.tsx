'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Broadcast, ArrowRight, Play, Users, PenTool, ChatBubble, Copy, Download, Badge, X } from '@/components/ui'
import { Field } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'
import { RecordingPlayer } from '@/components/live/RecordingPlayer'
import { statusBadge } from '@/components/live/liveUtils'
import { ScheduleModal } from '@/components/live/ScheduleModal'
import { useTeacherLiveClasses, useCreateLiveClass } from '@/hooks/live/useLiveClasses'
import { useCourses } from '@/hooks/courses/useCourses'
import type { LiveClass } from '@/lib/api/live'
import type { Course } from '@/types/course'

type Recording = typeof MOCK.live.recordings[number]

// ─── Inline "Start instant class" modal ──────────────────────────────────────

function StartClassModal({
  courses,
  onClose,
}: {
  courses: Course[]
  onClose: () => void
}) {
  const router = useRouter()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const [title, setTitle] = useState(`Instant class — ${new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' })}`)
  const [error, setError] = useState('')

  const createMutation = useCreateLiveClass(courseId)

  const handleStart = async () => {
    if (!courseId) { setError('Please select a course.'); return }
    if (!title.trim()) { setError('Please enter a title.'); return }

    try {
      const liveClass = await createMutation.mutateAsync({ course_id: courseId, title: title.trim() })
      onClose()
      router.push(`/live/room?classId=${liveClass.id}`)
    } catch {
      setError('Could not create the class. Please try again.')
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 'min(480px, 96vw)', padding: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="between" style={{ marginBottom: 20 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>New session</div>
            <h2 className="h3">Start instant class</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="col" style={{ gap: 16 }}>
          <Field label="Course">
            <select className="select" value={courseId} onChange={e => setCourseId(e.target.value)}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <Field label="Session title">
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
          </Field>

          {error && <div style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</div>}

          <div className="row" style={{ gap: 10, marginTop: 4 }}>
            <button className="btn btn-secondary btn-block" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-brand btn-block"
              onClick={handleStart}
              disabled={createMutation.isPending}
            >
              <Broadcast size={14} />
              {createMutation.isPending ? 'Starting…' : 'Start now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeacherLivePage() {
  const router = useRouter()
  const [rec, setRec] = useState<Recording | null>(null)
  const [scheduling, setScheduling] = useState(false)
  const [starting, setStarting] = useState(false)

  const { data: liveClasses = [] } = useTeacherLiveClasses()
  const { data: courses = [] } = useCourses()

  const liveNow = liveClasses.find((c: LiveClass) => c.status === 'live')
  const upcoming = liveClasses.filter((c: LiveClass) => c.status === 'scheduled')
  const L = MOCK.live

  const stats = [
    { label: 'Live now', value: liveNow ? '1' : '0', sub: 'session running', accent: !!liveNow },
    { label: 'Scheduled', value: upcoming.length || L.upcoming.filter(u => u.status !== 'live').length, sub: 'this week' },
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
          <button className="btn btn-brand" onClick={() => setStarting(true)}>
            <Broadcast size={14} /> Start instant class
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="card card-pad-lg">
            <div className="eyebrow" style={{ marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 34, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.02em', color: s.accent ? 'var(--brand)' : 'var(--ink)' }}>
              {s.value}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live now resume card */}
      {liveNow && (
        <div
          className="card elev"
          style={{ padding: 24, marginBottom: 28, display: 'flex', gap: 20, alignItems: 'center', borderColor: '#F3C6C0', background: 'var(--danger-tint)' }}
        >
          <div style={{ width: 120, height: 76, borderRadius: 'var(--r-md)', background: 'var(--brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Broadcast size={26} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <span className="live-pill-sm" style={{ marginBottom: 8 }}>LIVE NOW · REC</span>
            <div style={{ fontWeight: 600, fontSize: 18, margin: '8px 0 4px' }}>{liveNow.title}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {liveNow.course?.title} · Live session in progress
            </div>
          </div>
          <button className="btn btn-brand btn-lg" onClick={() => router.push(`/live/room?classId=${liveNow.id}`)}>
            <ArrowRight size={16} /> Rejoin class
          </button>
        </div>
      )}

      {/* Scheduled list */}
      <h2 className="h2" style={{ marginBottom: 16 }}>Scheduled</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 36 }}>
        {upcoming.length > 0
          ? upcoming.map((u: LiveClass, i: number) => (
            <div
              key={u.id}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < upcoming.length - 1 ? '1px solid var(--line)' : '0' }}
            >
              <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
                {u.scheduled_at && (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {new Date(u.scheduled_at).toLocaleDateString('en', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{new Date(u.scheduled_at).getDate()}</div>
                  </>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{u.title}</div>
                {u.course && <div className="muted" style={{ fontSize: 12 }}>{u.course.title}</div>}
              </div>
              <div className="row" style={{ gap: 8 }}>
                {statusBadge(u.status)}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-ghost btn-sm">Edit</button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => router.push(`/live/room?classId=${u.id}`)}
                >
                  Start
                </button>
              </div>
            </div>
          ))
          : L.upcoming.filter(u => u.status !== 'live').map((u, i, arr) => (
            <div
              key={u.id}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : '0' }}
            >
              <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{u.date.split(' ')[0]}</div>
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
                <button className="btn btn-secondary btn-sm" onClick={() => setStarting(true)}>Start</button>
              </div>
            </div>
          ))
        }
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
                    <div className={r.thumb} style={{ width: 48, height: 30, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
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
      {starting && courses.length > 0 && (
        <StartClassModal courses={courses} onClose={() => setStarting(false)} />
      )}
      {starting && courses.length === 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setStarting(false)}>
          <div className="card" style={{ padding: 28, maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 12, fontWeight: 600 }}>No courses yet</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Create a course first before starting a live class.</div>
            <button className="btn btn-secondary" onClick={() => setStarting(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
