'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Badge, Progress, SegControl, CourseThumb } from '@/components/ui'
import { MOCK } from '@/lib/mock-data'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Languages', label: 'Languages' },
  { value: 'Test Prep', label: 'Test Prep' },
  { value: 'Soft Skills', label: 'Soft Skills' },
]

export default function CoursesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const items = filter === 'all' ? MOCK.courses : MOCK.courses.filter(c => c.category === filter)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Library</div>
          <h1 className="h1">My Courses</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <SegControl options={FILTERS} value={filter} onChange={setFilter} />
          <button className="btn btn-secondary"><Plus size={14} /> Browse catalog</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {items.map(c => (
          <button key={c.id} className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', background: 'var(--card)' }}
            onClick={() => router.push(`/courses/${c.id}`)}>
            <CourseThumb course={c} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Badge>{c.tag}</Badge>
                {(c.progress as number) === 100 && <Badge tone="success">Done</Badge>}
                {(c.progress as number) === 0 && <Badge tone="warning">Not started</Badge>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>with {c.instructor}</div>
              <Progress value={c.progress} variant="brand" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                <span>{c.lessonsDone}/{c.lessonsTotal} lessons</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.progress}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
