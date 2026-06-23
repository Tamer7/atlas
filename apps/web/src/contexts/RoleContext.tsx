'use client'

import { useAuth } from '@/contexts/AuthContext'

export type AppRole = 'student' | 'teacher'

export function useRole() {
  const { user } = useAuth()
  const isTeacher = user?.roles.includes('teacher') ?? false
  const role: AppRole = isTeacher ? 'teacher' : 'student'

  return { role, isTeacher, isStudent: !isTeacher }
}
