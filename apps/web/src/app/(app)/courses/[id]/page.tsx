'use client'
import { use, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Circle, Lock, Play, Plus, ListChecks } from 'lucide-react'
import { Badge, Progress } from '@/components/ui'
import { useCourse } from '@/hooks/courses/useCourses'
import { useQuizzes } from '@/hooks/assessment/useQuizzes'
import { useRole } from '@/contexts/RoleContext'
import { AddModuleModal } from '@/components/teacher/AddModuleModal'
import { AddLessonModal } from '@/components/teacher/AddLessonModal'
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
  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)

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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">Curriculum</h2>
            <div className="row" style={{ gap: 8 }}>
              <div className="muted" style={{ fontSize: 13 }}>
                {course.lessons_done} of {course.lessons_total} complete
              </div>
              {isTeacher && (
                <>
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
                </>
              )}
            </div>
          </div>

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
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          <div style={{ marginTop: 32 }}>
            <div className="between" style={{ marginBottom: 16 }}>
              <h2 className="h2">Quizzes</h2>
              {isTeacher && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => router.push('/teacher/quizzes/new')}
                >
                  <Plus size={12} /> New quiz
                </button>
              )}
            </div>
            {quizzes.length === 0 ? (
              <div className="card card-pad muted" style={{ fontSize: 14 }}>
                {isTeacher
                  ? 'No quizzes for this course yet. Create one from the Quizzes page or here.'
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
        </div>

        <div>
          <div className="card card-pad-lg">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your progress</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 44, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                {course.progress}%
              </div>
              <div className="muted">complete</div>
            </div>
            <Progress value={course.progress} variant="brand" thick />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              <span>{course.lessons_done} done</span>
              <span>{course.lessons_total - course.lessons_done} remaining</span>
            </div>
          </div>

          {course.description && (
            <div className="card card-pad-lg" style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>About</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{course.description}</p>
            </div>
          )}
        </div>
      </div>

      {showAddModule && (
        <AddModuleModal courseId={id} onClose={() => setShowAddModule(false)} />
      )}
      {showAddLesson && (
        <AddLessonModal
          courseId={id}
          modules={course.modules}
          onClose={() => setShowAddLesson(false)}
        />
      )}
    </div>
  )
}
