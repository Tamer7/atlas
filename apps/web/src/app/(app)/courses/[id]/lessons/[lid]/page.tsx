'use client'
import React, { use, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Flag, MoreH, Play, Pause, CC, Volume, Maximize,
  Check, Circle, ListChecks, ArrowLeft, ArrowRight,
  Send, FileText,
  Tabs, Avatar, Badge,
} from '@/components/ui'
import { useCourse } from '@/hooks/courses/useCourses'
import { useLesson, useDiscussion, useCreateDiscussionPost } from '@/hooks/curriculum/useLesson'
import { useUpdateLessonProgress, useUpdateLessonNotes } from '@/hooks/curriculum/useLessonProgress'
import { getYouTubeId, youTubeEmbedUrl } from '@/lib/video'
import type { LessonChapter, Module } from '@/types/curriculum'

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function findAdjacentLessons(modules: Module[], lessonId: string) {
  const all = modules.flatMap(m => m.lessons)
  const idx = all.findIndex(l => l.id === lessonId)
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  }
}

function findModuleTitle(modules: Module[], lessonId: string): string {
  for (const m of modules) {
    if (m.lessons.some(l => l.id === lessonId)) return m.title
  }
  return ''
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lid: string }>
}) {
  const { id, lid } = use(params)
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const { data: course } = useCourse(id)
  const { data: lesson, isLoading, isError } = useLesson(lid)
  const { data: discussion = [] } = useDiscussion(lid)
  const updateProgress = useUpdateLessonProgress(lid, id)
  const updateNotes = useUpdateLessonNotes(lid)
  const createPost = useCreateDiscussionPost(lid)

  const [tab, setTab] = useState('notes')
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [cc, setCc] = useState(true)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(true)
  const [postBody, setPostBody] = useState('')

  const duration = lesson?.duration_seconds ?? 0
  const isVideo = lesson?.content_type === 'video' && !!lesson.video_url
  const youTubeId = isVideo ? getYouTubeId(lesson.video_url) : null
  const chapters: LessonChapter[] = lesson?.chapters ?? []
  const transcript = lesson?.transcript ?? []
  const attachments = lesson?.attachments ?? []
  const isCompleted = !!lesson?.progress?.completed_at

  const { prev, next } = course
    ? findAdjacentLessons(course.modules, lid)
    : { prev: null, next: null }
  const moduleTitle = course ? findModuleTitle(course.modules, lid) : ''

  useEffect(() => {
    if (lesson?.progress) {
      setT(lesson.progress.position_seconds)
      setNotes(lesson.progress.notes ?? '')
    }
  }, [lesson?.progress])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }, [speed])

  const markComplete = useCallback(() => {
    if (isCompleted) return
    updateProgress.mutate({ completed: true, position_seconds: duration })
  }, [isCompleted, updateProgress, duration])

  const saveProgress = useCallback((position: number) => {
    updateProgress.mutate({ position_seconds: Math.round(position) })
  }, [updateProgress])

  const handleNotesBlur = () => {
    if (notes === (lesson?.progress?.notes ?? '')) return
    setNotesSaved(false)
    updateNotes.mutate(
      { notes },
      { onSettled: () => setNotesSaved(true) }
    )
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postBody.trim()) return
    await createPost.mutateAsync({ body: postBody.trim() })
    setPostBody('')
  }

  const handleVideoTimeUpdate = () => {
    const el = videoRef.current
    if (!el) return
    setT(el.currentTime)
    if (Math.floor(el.currentTime) % 10 === 0) {
      saveProgress(el.currentTime)
    }
  }

  const handleVideoEnded = () => {
    setPlaying(false)
    markComplete()
  }

  const seekTo = (seconds: number) => {
    setT(seconds)
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
    }
  }

  const pct = duration > 0 ? (t / duration) * 100 : 0

  const tabs = [
    ...(transcript.length > 0 ? [{ id: 'transcript', label: 'Transcript' }] : []),
    { id: 'notes', label: 'Notes' },
    ...(attachments.length > 0
      ? [{ id: 'attachments', label: 'Attachments', count: attachments.length }]
      : []),
    { id: 'discussion', label: 'Q&A', count: discussion.length },
  ]
  const activeTab = tabs.some(item => item.id === tab) ? tab : (tabs[0]?.id ?? 'notes')

  if (isLoading) {
    return <div className="muted" style={{ padding: 32 }}>Loading lesson…</div>
  }

  if (isError || !lesson) {
    return (
      <div className="card card-pad" style={{ color: 'var(--danger)' }}>
        Lesson not found or you do not have access.
      </div>
    )
  }

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
              {course?.title ?? 'Course'}
            </a>
            {moduleTitle && <> · {moduleTitle}</>}
            {' · Lesson '}{lesson.number}
          </div>
          <h1 className="h2" style={{ maxWidth: 800 }}>{lesson.title}</h1>
        </div>
        <div className="row">
          {isCompleted && <Badge tone="success">Completed</Badge>}
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
          {youTubeId ? (
            <div className="video-stage">
              <iframe
                src={youTubeEmbedUrl(youTubeId)}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
          ) : isVideo ? (
            <div className="video-stage">
              <video
                ref={videoRef}
                src={lesson.video_url!}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />

              {!playing && (
                <button
                  onClick={() => videoRef.current?.play()}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,.3)',
                    border: 0,
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    zIndex: 2,
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
                <button
                  className="video-btn"
                  onClick={() => (playing ? videoRef.current?.pause() : videoRef.current?.play())}
                >
                  {playing ? <Pause size={16} /> : <Play size={14} fill="#fff" />}
                </button>
                <span className="video-time">{fmt(t)}</span>
                <div
                  className="scrub"
                  onClick={e => {
                    const r = e.currentTarget.getBoundingClientRect()
                    const pos = ((e.clientX - r.left) / r.width) * duration
                    seekTo(pos)
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
                <button className="video-btn"><Volume size={16} /></button>
                <button className="video-btn"><Maximize size={14} /></button>
              </div>
            </div>
          ) : (
            <div className="card card-pad-lg">
              {lesson.body ? (
                <div
                  style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}
                  dangerouslySetInnerHTML={{ __html: lesson.body }}
                />
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  No content has been added to this lesson yet.
                </p>
              )}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              marginBottom: 24,
            }}
          >
            {prev ? (
              <button
                className="btn btn-secondary"
                onClick={() => router.push(`/courses/${id}/lessons/${prev.id}`)}
              >
                <ArrowLeft size={14} /> Previous · {prev.title}
              </button>
            ) : (
              <div />
            )}
            {next ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!isCompleted) markComplete()
                  router.push(`/courses/${id}/lessons/${next.id}`)
                }}
              >
                Next · {next.title} <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={markComplete}
                disabled={isCompleted || updateProgress.isPending}
              >
                {isCompleted ? 'Lesson complete' : 'Mark complete'} <Check size={14} />
              </button>
            )}
          </div>

          <Tabs tabs={tabs} value={activeTab} onChange={setTab} />
          <div style={{ padding: '24px 0' }}>
            {activeTab === 'transcript' && transcript.length > 0 && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {transcript.map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
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

            {activeTab === 'notes' && (
              <div>
                <textarea
                  className="textarea"
                  rows={8}
                  placeholder="Take notes here. They sync to your lessons."
                  value={notes}
                  onChange={e => {
                    setNotes(e.target.value)
                    setNotesSaved(false)
                  }}
                  onBlur={handleNotesBlur}
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
                    {updateNotes.isPending
                      ? 'Saving…'
                      : notesSaved
                        ? 'Saved · Private to you'
                        : 'Unsaved changes'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attachments' && attachments.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {attachments.map((f, i) => (
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
                      <FileText size={18} color="var(--brand)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</div>
                      {f.type && (
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{f.type}</div>
                      )}
                    </div>
                    {f.url && (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div>
                <form onSubmit={handlePostSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <Avatar name="You" />
                  <div style={{ flex: 1 }}>
                    <textarea
                      className="textarea"
                      placeholder="Ask a question or share an example..."
                      value={postBody}
                      onChange={e => setPostBody(e.target.value)}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: 8,
                      }}
                    >
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={!postBody.trim() || createPost.isPending}
                      >
                        <Send size={12} /> {createPost.isPending ? 'Posting…' : 'Post'}
                      </button>
                    </div>
                  </div>
                </form>
                {discussion.length === 0 ? (
                  <p className="muted" style={{ fontSize: 14 }}>No questions yet. Be the first to ask!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {discussion.map(d => (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex',
                          gap: 12,
                          padding: 14,
                          background: 'var(--paper-2)',
                          borderRadius: 'var(--r-md)',
                        }}
                      >
                        <Avatar name={d.user.name} color={d.user.color ?? undefined} />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <b style={{ fontSize: 13 }}>{d.user.name}</b>
                            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                              · {formatRelativeTime(d.created_at)}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{d.body}</div>
                          {(d.replies?.length ?? 0) > 0 && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: 0, marginTop: 8 }}
                            >
                              {d.replies!.length} replies
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {chapters.length > 0 && (
          <div>
            <div className="card" style={{ padding: 14 }}>
              <div className="between" style={{ marginBottom: 10, padding: '0 4px' }}>
                <div className="eyebrow">Chapters</div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {chapters.filter(c => c.done).length}/{chapters.length}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chapters.map((ch, i) => {
                  const isDone = !!ch.done
                  const isCurrent = !!ch.current
                  const chapterTime = ch.t ?? 0
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
                      key={ch.id ?? i}
                      className={`chapter${isCurrent ? ' active' : ''}${isDone ? ' done' : ''}`}
                      style={{ border: 0, width: '100%', textAlign: 'left' }}
                      onClick={() => seekTo(chapterTime)}
                    >
                      <div className="chap-num">{String(ch.n ?? i + 1).padStart(2, '0')}</div>
                      <div style={{ width: 16, display: 'grid', placeItems: 'center' }}>
                        {icon}
                      </div>
                      <div className="chap-title">{ch.title}</div>
                      <div className="chap-time">{ch.time ?? fmt(chapterTime)}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {lesson.quiz_id && (
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
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Practice quiz</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Test your knowledge</div>
                  </div>
                </div>
                <button
                  className="btn btn-brand btn-sm btn-block"
                  style={{ marginTop: 12 }}
                  onClick={() => router.push(`/quiz/${lesson.quiz_id}`)}
                >
                  Start quiz <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
