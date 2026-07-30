'use client'

import { useAuth } from '@/contexts/AuthContext'

export type AppRole = 'student' | 'teacher' | 'admin'

export function useRole() {
  const { user } = useAuth()
  const roles = user?.roles ?? []

  const isAdmin = roles.includes('admin')
  const isTeacher = roles.includes('teacher')

  const role: AppRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student'

  return { role, isAdmin, isTeacher, isStudent: role === 'student' }
}
