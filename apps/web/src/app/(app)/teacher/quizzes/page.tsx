'use client'

import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash, ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui'
import { useTeacherQuizzes, useDeleteQuiz } from '@/hooks/assessment/useQuizzes'

export default function TeacherQuizzesPage() {
  const router = useRouter()
  const { data: quizzes = [], isLoading, isError } = useTeacherQuizzes()

  if (isLoading) {
    return <div className="muted card-pad">Loading quizzes…</div>
  }

  if (isError) {
    return <div className="card card-pad" style={{ color: 'var(--danger)' }}>Could not load quizzes.</div>
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Assess</div>
          <h1 className="h1">Quizzes</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 520 }}>
            Create and manage quizzes for your courses. Published quizzes appear on the course page for students.
          </p>
        </div>
        <button className="btn btn-brand" onClick={() => router.push('/teacher/quizzes/new')}>
          <Plus size={14} /> New quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="card card-pad-lg" style={{ textAlign: 'center' }}>
          <ListChecks size={32} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
          <p className="h3" style={{ marginBottom: 8 }}>No quizzes yet</p>
          <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Build your first quiz, publish it, and students will see it on the course page.
          </p>
          <button className="btn btn-brand" onClick={() => router.push('/teacher/quizzes/new')}>
            <Plus size={14} /> Create quiz
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {quizzes.map((quiz, i) => (
            <QuizRow key={quiz.id} quiz={quiz} isLast={i === quizzes.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuizRow({
  quiz,
  isLast,
}: {
  quiz: {
    id: string
    title: string
    course_id: string
    course_title?: string
    questions_count: number
    published_at: string | null
    quiz_type: string
  }
  isLast: boolean
}) {
  const router = useRouter()
  const deleteQuiz = useDeleteQuiz(quiz.course_id)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        borderBottom: isLast ? 0 : '1px solid var(--line)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{quiz.title}</div>
        <div className="row muted" style={{ fontSize: 12, gap: 8 }}>
          <span>{quiz.course_title ?? 'Course'}</span>
          <span className="dot-sep" />
          <span>{quiz.questions_count} questions</span>
          <span className="dot-sep" />
          <span style={{ textTransform: 'capitalize' }}>{quiz.quiz_type}</span>
        </div>
      </div>
      {quiz.published_at ? (
        <Badge tone="success">Published</Badge>
      ) : (
        <Badge tone="accent">Draft</Badge>
      )}
      <div className="row" style={{ gap: 6 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => router.push(`/teacher/quizzes/${quiz.id}/edit`)}
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--danger)' }}
          disabled={deleteQuiz.isPending}
          onClick={() => {
            if (confirm(`Delete "${quiz.title}"?`)) {
              deleteQuiz.mutate(quiz.id)
            }
          }}
        >
          <Trash size={12} />
        </button>
      </div>
    </div>
  )
}
