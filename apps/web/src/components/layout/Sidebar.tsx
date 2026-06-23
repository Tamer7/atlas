'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, Radio, Play, ListChecks, ClipboardCheck, TrendingUp,
         Settings, Users, Pencil, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useRole } from '@/contexts/RoleContext'
import { MOCK } from '@/lib/mock-data'
import { useAuth } from '@/contexts/AuthContext'
import { useLogout } from '@/hooks/auth/useLogout'

const studentNav = [
  { group: 'Learn', items: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses', count: 4 },
    { id: 'live', label: 'Live Classes', icon: Radio, href: '/live', live: true },
    { id: 'lesson', label: 'Continue Lesson', icon: Play, href: '/courses/1/lessons/l15' },
  ]},
  { group: 'Assessments', items: [
    { id: 'quiz', label: 'Quizzes', icon: ListChecks, href: '/quiz/q1', count: 2 },
    { id: 'exam', label: 'Exams', icon: ClipboardCheck, href: '/exam/e1', count: 1 },
    { id: 'results', label: 'Results', icon: TrendingUp, href: '/results/demo' },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

const teacherNav = [
  { group: 'Teach', items: [
    { id: 't-dashboard', label: 'Dashboard', icon: Home, href: '/teacher' },
    { id: 'roster', label: 'Students', icon: Users, href: '/teacher/students', count: 8 },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses', count: 4 },
    { id: 'live', label: 'Live Classes', icon: Radio, href: '/teacher/live', live: true },
  ]},
  { group: 'Assess', items: [
    { id: 'builder', label: 'Quiz Builder', icon: Pencil, href: '/teacher/quiz/new' },
    { id: 'grading', label: 'Grading Queue', icon: ClipboardCheck, href: '/teacher/grading', count: 5 },
    { id: 'results', label: 'Reports', icon: TrendingUp, href: '/teacher/reports' },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, setRole } = useRole()
  const { user } = useAuth()
  const logout = useLogout()
  const nav = role === 'teacher' ? teacherNav : studentNav
  const displayUser = role === 'teacher' ? MOCK.teacher : MOCK.user

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <div className="logo">A</div>
        <div className="name">Atlas</div>
      </div>

      <div className="role-switch" role="tablist" aria-label="Switch role">
        <button
          className={role === 'student' ? 'active' : ''}
          onClick={() => { setRole('student'); router.push('/dashboard') }}>
          Student
        </button>
        <button
          className={role === 'teacher' ? 'active' : ''}
          onClick={() => { setRole('teacher'); router.push('/teacher') }}>
          Teacher
        </button>
      </div>

      {nav.map(grp => (
        <div className="nav-section" key={grp.group}>
          <div className="eyebrow">{grp.group}</div>
          {grp.items.map(it => {
            const Icon = it.icon
            const active = pathname === it.href || (it.href !== '/dashboard' && it.href !== '/teacher' && pathname.startsWith(it.href))
            return (
              <button
                key={it.id}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => router.push(it.href)}>
                <Icon className="nav-icon" size={16} />
                <span>{it.label}</span>
                {'live' in it && it.live && (
                  <span className="live-pill-sm" style={{ marginLeft: 'auto' }}>LIVE</span>
                )}
                {'count' in it && it.count != null && (
                  <span className="nav-count">{it.count}</span>
                )}
              </button>
            )
          })}
        </div>
      ))}

      <div className="sidebar-foot">
        <Avatar name={user?.name ?? displayUser.name} color={displayUser.color} />
        <div className="who">
          <b>{user?.name ?? displayUser.name}</b>
          <span>{role === 'teacher' ? 'Instructor' : 'Student'}</span>
        </div>
        <button className="btn btn-ghost btn-icon" title="Sign out" onClick={() => logout.mutate()}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
