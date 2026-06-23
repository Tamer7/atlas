'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, Progress } from '@/components/ui'
import { useCourse } from '@/hooks/courses/useCourses'

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: course, isLoading, isError } = useCourse(id)

  if (isLoading) {
    return <div className="muted" style={{ padding: 32 }}>Loading course…</div>
  }

  if (isError || !course) {
    return (
      <div className="card card-pad" style={{ color: 'var(--danger)' }}>
        Course not found or you do not have access.
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: 0, fontWeight: 500 }}
              onClick={() => router.push('/courses')}
            >
              Courses
            </button>
            {' / '}{course.title}
          </div>
          <h1 className="h1" style={{ maxWidth: 700 }}>{course.title}</h1>
          <div className="row" style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>
            <span>with <b style={{ color: 'var(--ink)' }}>{course.instructor.name}</b></span>
            <span className="dot-sep" />
            <span>{course.lessons_total} lessons</span>
            <span className="dot-sep" />
            <Badge tone="brand">{course.tag}</Badge>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        <div>
          <div className="between" style={{ marginBottom: 16 }}>
            <h2 className="h2">Curriculum</h2>
            <div className="muted" style={{ fontSize: 13 }}>
              {course.lessons_done} of {course.lessons_total} complete
            </div>
          </div>

          {course.modules.length === 0 ? (
            <div className="card card-pad muted">
              Curriculum will appear here once lessons are added.
            </div>
          ) : (
            course.modules.map(m => (
              <div key={m.id} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="eyebrow">{m.title}</div>
                  <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <div className="card card-pad-lg">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your progress</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 44, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                {course.progress}%
              </div>
              <div className="muted">complete</div>
            </div>
            <Progress value={course.progress} variant="brand" thick />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              <span>{course.lessons_done} done</span>
              <span>{course.lessons_total - course.lessons_done} remaining</span>
            </div>
          </div>

          {course.description && (
            <div className="card card-pad-lg" style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>About</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{course.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
