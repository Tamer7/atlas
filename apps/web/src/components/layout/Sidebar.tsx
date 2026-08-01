'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BookOpen, Radio, Settings, Users, Pencil, LogOut, ClipboardCheck, TrendingUp, CircleUser, CalendarDays, type LucideIcon } from 'lucide-react'
import { Avatar, Badge, Skeleton } from '@/components/ui'
import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLogout } from '@/hooks/auth/useLogout'

type NavItem = { id: string; label: string; icon: LucideIcon; href: string; soon?: boolean }
type NavGroup = { group: string; items: NavItem[] }

const studentNav: NavGroup[] = [
  { group: 'Learn', items: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses' },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays, href: '/schedule' },
    { id: 'live', label: 'Live Classes', icon: Radio, href: '/live', soon: true },
  ]},
  { group: 'Account', items: [
    { id: 'profile', label: 'My Profile', icon: CircleUser, href: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

const teacherNav: NavGroup[] = [
  { group: 'Teach', items: [
    { id: 't-dashboard', label: 'Dashboard', icon: Home, href: '/teacher' },
    { id: 'roster', label: 'Students', icon: Users, href: '/teacher/students' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/courses' },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays, href: '/schedule' },
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

const adminNav: NavGroup[] = [
  { group: 'Administration', items: [
    { id: 'admin-users', label: 'Users', icon: Users, href: '/admin/users' },
  ]},
  { group: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]},
]

interface SidebarProps {
  id?: string
  /** Drawer state — only has a visual effect below the 960px breakpoint. */
  open?: boolean
  onNavigate?: () => void
}

export function Sidebar({ id, open = false, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { isTeacher, isAdmin } = useRole()
  const { user, isLoading } = useAuth()
  const logout = useLogout()
  const nav = isAdmin ? adminNav : isTeacher ? teacherNav : studentNav

  return (
    <aside id={id} className={`sidebar${open ? ' open' : ''}`}>
      <div className="brand-mark">
        <div className="logo">A</div>
        <div className="name">Atlas</div>
      </div>

      {nav.map(grp => (
        <nav className="nav-section" key={grp.group} aria-label={grp.group}>
          <div className="eyebrow">{grp.group}</div>
          {grp.items.map(it => {
            const Icon = it.icon
            const active = pathname === it.href || (it.href !== '/dashboard' && it.href !== '/teacher' && pathname.startsWith(it.href))
            return (
              <Link
                key={it.id}
                href={it.href}
                className={`nav-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}>
                <Icon className="nav-icon" size={16} />
                <span>{it.label}</span>
                {'soon' in it && it.soon && (
                  <Badge tone="accent" style={{ marginLeft: 'auto', fontSize: 10 }}>Soon</Badge>
                )}
              </Link>
            )
          })}
        </nav>
      ))}

      <div className="sidebar-foot">
        {isLoading ? (
          <>
            <Skeleton w={32} h={32} circle />
            <div className="who" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton w="70%" h={11} />
              <Skeleton w="45%" h={9} />
            </div>
          </>
        ) : (
          <>
            <Avatar name={user?.name ?? '??'} color={user?.color} />
            <div className="who">
              <b>{user?.name ?? 'Signed out'}</b>
              <span>{isAdmin ? 'Administrator' : isTeacher ? 'Instructor' : 'Student'}</span>
            </div>
            <button className="btn btn-ghost btn-icon" title="Sign out" onClick={() => logout.mutate()}>
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
