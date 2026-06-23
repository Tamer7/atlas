'use client'

import { use } from 'react'
import { redirect } from 'next/navigation'

export default function LegacyQuizNewRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = use(searchParams)
  if (params.edit) {
    redirect(`/teacher/quizzes/${params.edit}/edit`)
  }
  redirect('/teacher/quizzes/new')
}
