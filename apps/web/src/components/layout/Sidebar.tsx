'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, Radio, Settings, Users, Pencil, LogOut, ClipboardCheck, TrendingUp } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLogout } from '@/hooks/auth/useLogout'

const studentNav = [
  { group: 'Learn', items: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses' },
    { id: 'live', label: 'Live Classes', icon: Radio, href: '/live', soon: true },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

const teacherNav = [
  { group: 'Teach', items: [
    { id: 't-dashboard', label: 'Dashboard', icon: Home, href: '/teacher' },
    { id: 'roster', label: 'Students', icon: Users, href: '/teacher/students' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses' },
    { id: 'live', label: 'Live Classes', icon: Radio, href: '/teacher/live', soon: true },
  ]},
  { group: 'Assess', items: [
    { id: 'builder', label: 'Quizzes', icon: Pencil, href: '/teacher/quizzes' },
    { id: 'grading', label: 'Grading Queue', icon: ClipboardCheck, href: '/teacher/grading' },
    { id: 'results', label: 'Reports', icon: TrendingUp, href: '/teacher/reports' },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isTeacher } = useRole()
  const { user } = useAuth()
  const logout = useLogout()
  const nav = isTeacher ? teacherNav : studentNav

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <div className="logo">A</div>
        <div className="name">Atlas</div>
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
                {'soon' in it && it.soon && (
                  <Badge tone="accent" style={{ marginLeft: 'auto', fontSize: 10 }}>Soon</Badge>
                )}
              </button>
            )
          })}
        </div>
      ))}

      <div className="sidebar-foot">
        <Avatar name={user?.name ?? '??'} color={user?.color} />
        <div className="who">
          <b>{user?.name ?? '…'}</b>
          <span>{isTeacher ? 'Instructor' : 'Student'}</span>
        </div>
        <button className="btn btn-ghost btn-icon" title="Sign out" onClick={() => logout.mutate()}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
