'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@/components/ui'
import { useQuiz } from '@/hooks/assessment/useQuiz'

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: quiz, isLoading, isError } = useQuiz(id)

  if (isLoading) {
    return <div className="muted card-pad">Loading quiz…</div>
  }

  if (isError || !quiz) {
    return (
      <div className="card card-pad" style={{ color: 'var(--danger)' }}>
        Quiz not found.
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => router.push('/teacher/quizzes')}>
          Back to quizzes
        </button>
      </div>
    )
  }

  // Edit reuses the new builder with quiz data — open new page with prefill via redirect for now
  // Full inline edit: load quiz into builder state (same as new page)
  return (
    <div>
      <div className="page-head">
        <button className="btn btn-ghost btn-sm" onClick={() => router.push('/teacher/quizzes')}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="h1">{quiz.title}</h1>
      </div>
      <div className="card card-pad">
        <p className="muted" style={{ marginBottom: 16 }}>
          Editing &quot;{quiz.title}&quot; — {quiz.questions?.length ?? 0} questions.
          {quiz.published_at ? ' Published.' : ' Draft.'}
        </p>
        <p style={{ fontSize: 14, marginBottom: 20 }}>
          To change questions, delete and recreate for now, or use the course page. Full edit-in-place is coming next.
        </p>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => router.push(`/courses/${quiz.course_id}`)}>
            View on course
          </button>
          {!quiz.published_at && (
            <button className="btn btn-brand" onClick={() => router.push('/teacher/quizzes/new')}>
              Create new quiz instead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
