'use client'
import { Stat } from '@/components/ui'
import { useReports } from '@/hooks/analytics/useReports'

export default function ReportsPage() {
  const { data: reports, isLoading, isError } = useReports()
  const summary = reports?.summary
  const courses = reports?.courses ?? []

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Assess</div>
          <h1 className="h1">Reports</h1>
        </div>
      </div>

      {isLoading && <div className="muted" style={{ marginBottom: 24 }}>Loading reports…</div>}
      {isError && <div className="muted" style={{ marginBottom: 24 }}>Could not load reports.</div>}

      {summary && (
        <div className="card card-pad-lg" style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
          <Stat label="Total Students" value={String(summary.total_students)} sub="enrolled" />
          <Stat label="Avg Score" value={`${Math.round(summary.avg_score)}%`} sub="across all assessments" accent />
          <Stat label="Avg Attendance" value={`${Math.round(summary.avg_attendance)}%`} sub="session attendance" />
          <Stat label="At-Risk Students" value={String(summary.at_risk_students)} sub="need attention" />
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
          gap: 12,
          padding: '12px 18px',
          borderBottom: '1px solid var(--line)',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--muted)',
        }}>
          <span>Course</span>
          <span>Students</span>
          <span>Avg score</span>
          <span>Attendance</span>
          <span>Completion</span>
          <span>At-risk</span>
        </div>
        {courses.length === 0 && !isLoading && (
          <div className="card-pad muted" style={{ fontSize: 13 }}>No course data available yet.</div>
        )}
        {courses.map(course => (
          <div
            key={course.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: 12,
              padding: '14px 18px',
              borderBottom: '1px solid var(--line)',
              fontSize: 13,
              alignItems: 'center',
            }}
          >
            <b>{course.title}</b>
            <span>{course.students_count}</span>
            <span>{Math.round(course.avg_score)}%</span>
            <span>{Math.round(course.avg_attendance)}%</span>
            <span>{Math.round(course.completion_pct)}%</span>
            <span style={{ color: course.at_risk_count > 0 ? 'var(--danger)' : 'var(--muted)' }}>
              {course.at_risk_count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
