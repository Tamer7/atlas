'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Badge, Progress, SegControl, CourseThumb } from '@/components/ui'
import { useCourses } from '@/hooks/courses/useCourses'
import { useAuth } from '@/contexts/AuthContext'
import { CreateCourseModal } from '@/components/teacher/CreateCourseModal'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Languages', label: 'Languages' },
  { value: 'Test Prep', label: 'Test Prep' },
  { value: 'Soft Skills', label: 'Soft Skills' },
]

export default function CoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const isTeacher = user?.roles.includes('teacher')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const { data: courses = [], isLoading, isError } = useCourses()

  const items = filter === 'all'
    ? courses
    : courses.filter(c => c.category === filter)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Library</div>
          <h1 className="h1">{isTeacher ? 'My Courses' : 'My Courses'}</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <SegControl options={FILTERS} value={filter} onChange={setFilter} />
          {isTeacher && (
            <button className="btn btn-brand" onClick={() => setShowCreate(true)}>
              <Plus size={14} /> New course
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="muted" style={{ padding: 32, textAlign: 'center' }}>Loading courses…</div>
      )}

      {isError && (
        <div className="card card-pad" style={{ color: 'var(--danger)' }}>
          Could not load courses. Please try again.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="card card-pad-lg" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          {isTeacher
            ? 'No courses yet. Create your first course to get started.'
            : 'You are not enrolled in any courses yet.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {items.map(c => (
          <button key={c.id} className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', background: 'var(--card)' }}
            onClick={() => router.push(`/courses/${c.id}`)}>
            <CourseThumb course={c} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Badge>{c.tag}</Badge>
                {c.progress === 100 && <Badge tone="success">Done</Badge>}
                {c.progress === 0 && <Badge tone="warning">Not started</Badge>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>with {c.instructor.name}</div>
              <Progress value={c.progress} variant="brand" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                <span>{c.lessons_done}/{c.lessons_total} lessons</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.progress}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
