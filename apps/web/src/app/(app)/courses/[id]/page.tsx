'use client'
import { use, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CalendarDays, Check, Circle, Lock, Pencil, Play, Plus, ListChecks } from 'lucide-react'
import { Badge, Progress, Tabs } from '@/components/ui'
import { useCourse } from '@/hooks/courses/useCourses'
import { useQuizzes } from '@/hooks/assessment/useQuizzes'
import { useCourseSchedule } from '@/hooks/schedule/useSchedule'
import { useRole } from '@/contexts/RoleContext'
import { AddModuleModal } from '@/components/teacher/AddModuleModal'
import { LessonEditorModal } from '@/components/teacher/LessonEditorModal'
import { ScheduleManagerModal } from '@/components/teacher/ScheduleManagerModal'
import { dayName } from '@/types/schedule'
import type { Lesson, LessonStatus } from '@/types/curriculum'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

function LessonStatusIcon({ status }: { status: LessonStatus }) {
  if (status === 'done') return <Check size={14} color="var(--success)" />
  if (status === 'current') return <Play size={12} fill="var(--brand)" color="var(--brand)" />
  if (status === 'locked') return <Lock size={12} color="var(--faint)" />
  return <Circle size={10} color="var(--faint)" />
}

function lessonRowStyle(status: LessonStatus): CSSProperties {
  if (status === 'current') return { background: 'var(--brand-tint)' }
  if (status === 'locked') return { opacity: 0.55, cursor: 'not-allowed' }
  return {}
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isTeacher } = useRole()
  const { data: course, isLoading, isError } = useCourse(id)
  const { data: quizzes = [] } = useQuizzes(id)
  const { data: schedule = [] } = useCourseSchedule(id)
  const [tab, setTab] = useState('curriculum')
  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  if (isLoading) {
    return <div className="muted" style={{ padding: 32 }}>Loading course…</div>
  }

  if (isError || !course) {
    return (
      <div className="card card-pad" style={{ color: 'var(--danger)' }}>
        Course not found or you do not have access.
      </div>
    )
  }

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === 'locked' || lesson.is_locked) return
    if (lesson.has_quiz && lesson.quiz_id) {
      router.push(`/quiz/${lesson.quiz_id}`)
      return
    }
    router.push(`/courses/${id}/lessons/${lesson.id}`)
  }

  const tabs = [
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'quizzes', label: 'Quizzes', count: quizzes.length },
    { id: 'schedule', label: 'Schedule', count: schedule.length },
    ...(course.description ? [{ id: 'about', label: 'About' }] : []),
  ]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: 0, fontWeight: 500 }}
              onClick={() => router.push('/courses')}
            >
              Courses
            </button>
            {' / '}{course.title}
          </div>
          <h1 className="h1" style={{ maxWidth: 700 }}>{course.title}</h1>
          <div className="row" style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>
            <span>with <b style={{ color: 'var(--ink)' }}>{course.instructor.name}</b></span>
            <span className="dot-sep" />
            <span>{course.lessons_total} lessons</span>
            <span className="dot-sep" />
            <Badge tone="brand">{course.tag}</Badge>
          </div>
        </div>
        {!isTeacher && (
          <div className="card card-pad" style={{ minWidth: 200 }}>
            <div className="between" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Your progress</span>
              <b style={{ fontSize: 14 }}>{course.progress}%</b>
            </div>
            <Progress value={course.progress} variant="brand" />
            <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
              {course.lessons_done} done · {course.lessons_total - course.lessons_done} remaining
            </div>
          </div>
        )}
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      <div style={{ paddingTop: 24, maxWidth: 860 }}>
        {tab === 'curriculum' && (
          <div>
            {isTeacher && (
              <div className="row" style={{ gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModule(true)}>
                  <Plus size={12} /> Add module
                </button>
                <button
                  className="btn btn-brand btn-sm"
                  onClick={() => setShowAddLesson(true)}
                  disabled={course.modules.length === 0}
                >
                  <Plus size={12} /> Add lesson
                </button>
              </div>
            )}

            {course.modules.length === 0 ? (
              <div className="card card-pad muted">
                {isTeacher
                  ? 'No modules yet. Click "Add module" to start building the curriculum.'
                  : 'Curriculum will appear here once lessons are added.'}
              </div>
            ) : (
              course.modules.map(m => (
                <div key={m.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div className="eyebrow">{m.title}</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  </div>
                  {m.lessons.length === 0 ? (
                    <div className="muted" style={{ fontSize: 13, padding: '4px 0 8px' }}>
                      No lessons in this module yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {m.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          type="button"
                          className="chapter"
                          style={{
                            border: 0,
                            width: '100%',
                            textAlign: 'left',
                            ...lessonRowStyle(lesson.status),
                          }}
                          disabled={lesson.status === 'locked' || lesson.is_locked}
                          onClick={() => handleLessonClick(lesson)}
                        >
                          <div className="chap-num">{String(lesson.number).padStart(2, '0')}</div>
                          <div style={{ width: 16, display: 'grid', placeItems: 'center' }}>
                            <LessonStatusIcon status={lesson.status} />
                          </div>
                          <div className="chap-title">{lesson.title}</div>
                          <div className="chap-time">{formatDuration(lesson.duration_seconds)}</div>
                          {lesson.has_quiz && (
                            <Badge tone="brand" style={{ fontSize: 10 }}>Quiz</Badge>
                          )}
                          {lesson.status === 'current' && (
                            <Badge tone="brand" style={{ fontSize: 10 }}>Current</Badge>
                          )}
                          {lesson.status === 'done' && (
                            <Badge tone="success" style={{ fontSize: 10 }}>Done</Badge>
                          )}
                          {isTeacher && (
                            <span
                              role="button"
                              tabIndex={0}
                              className="btn btn-ghost btn-icon"
                              title="Edit lesson"
                              onClick={e => {
                                e.stopPropagation()
                                setEditLesson(lesson)
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation()
                                  setEditLesson(lesson)
                                }
                              }}
                            >
                              <Pencil size={12} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'quizzes' && (
          <div>
            {isTeacher && (
              <div className="row" style={{ marginBottom: 16, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-brand btn-sm"
                  onClick={() => router.push('/teacher/quizzes/new')}
                >
                  <Plus size={12} /> New quiz
                </button>
              </div>
            )}
            {quizzes.length === 0 ? (
              <div className="card card-pad muted" style={{ fontSize: 14 }}>
                {isTeacher
                  ? 'No quizzes for this course yet. Create the first one.'
                  : 'No quizzes available yet.'}
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                {quizzes.map((quiz, i) => (
                  <div
                    key={quiz.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      borderBottom: i < quizzes.length - 1 ? '1px solid var(--line)' : 0,
                    }}
                  >
                    <ListChecks size={18} color="var(--brand)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{quiz.title}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {quiz.questions_count ?? quiz.questions?.length ?? 0} questions
                        {quiz.time_limit_minutes ? ` · ${quiz.time_limit_minutes} min` : ''}
                        {quiz.due_at ? ` · due ${new Date(quiz.due_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}` : ''}
                      </div>
                    </div>
                    {isTeacher && !quiz.published_at && (
                      <Badge tone="accent">Draft</Badge>
                    )}
                    {isTeacher ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => router.push(`/teacher/quizzes/${quiz.id}/edit`)}
                      >
                        Edit
                      </button>
                    ) : quiz.published_at ? (
                      <button
                        className="btn btn-brand btn-sm"
                        onClick={() => router.push(`/quiz/${quiz.id}`)}
                      >
                        Take quiz
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'schedule' && (
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/schedule')}>
                <CalendarDays size={12} /> Open calendar <ArrowRight size={12} />
              </button>
              {isTeacher && (
                <button className="btn btn-brand btn-sm" onClick={() => setShowSchedule(true)}>
                  Manage
                </button>
              )}
            </div>
            {schedule.length === 0 ? (
              <div className="card card-pad muted" style={{ fontSize: 14 }}>
                {isTeacher
                  ? 'No class times yet. Click "Manage" to set the weekly schedule.'
                  : 'No class times have been scheduled yet.'}
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                {schedule.map((slot, i) => (
                  <div
                    key={slot.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      borderBottom: i < schedule.length - 1 ? '1px solid var(--line)' : 0,
                    }}
                  >
                    <div style={{ minWidth: 100, fontWeight: 600, fontSize: 14 }}>
                      {dayName(slot.day_of_week)}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
                      {slot.start_time}–{slot.end_time}
                    </div>
                    <div className="muted" style={{ flex: 1, fontSize: 13 }}>{slot.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'about' && course.description && (
          <div className="card card-pad-lg">
            <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{course.description}</p>
          </div>
        )}
      </div>

      {showAddModule && (
        <AddModuleModal courseId={id} onClose={() => setShowAddModule(false)} />
      )}
      {showAddLesson && (
        <LessonEditorModal
          courseId={id}
          modules={course.modules}
          onClose={() => setShowAddLesson(false)}
        />
      )}
      {editLesson && (
        <LessonEditorModal
          courseId={id}
          modules={course.modules}
          lesson={editLesson}
          onClose={() => setEditLesson(null)}
        />
      )}
      {showSchedule && (
        <ScheduleManagerModal courseId={id} onClose={() => setShowSchedule(false)} />
      )}
    </div>
  )
}
