'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, SkeletonForm } from '@/components/ui'
import { QuizBuilder } from '@/components/teacher/QuizBuilder'
import { useQuiz } from '@/hooks/assessment/useQuiz'

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: quiz, isLoading, isError } = useQuiz(id)

  if (isLoading) {
    return <SkeletonForm fields={5} />
  }

  if (isError || !quiz) {
    return (
      <div className="card card-pad" style={{ color: 'var(--danger)' }}>
        Quiz not found.
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => router.push('/teacher/quizzes')}>
          <ArrowLeft size={14} /> Back to quizzes
        </button>
      </div>
    )
  }

  return <QuizBuilder key={quiz.id} quiz={quiz} />
}
