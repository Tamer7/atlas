'use client'
import { Stat, Skeleton, SkeletonTable } from '@/components/ui'
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

      {isError && <div className="muted" style={{ marginBottom: 24 }}>Could not load reports.</div>}

      {isLoading && (
        <div aria-busy="true" aria-label="Loading reports">
          <div className="card card-pad-lg stat-row" style={{ marginBottom: 24 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton w={110} h={11} />
                <Skeleton w={72} h={26} />
                <Skeleton w={130} h={10} />
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <SkeletonTable rows={5} cols={6} />
          </div>
        </div>
      )}

      {summary && (
        <div className="card card-pad-lg stat-row" style={{ marginBottom: 24 }}>
          <Stat label="Total Students" value={String(summary.total_students)} sub="enrolled" />
          <Stat label="Avg Score" value={`${Math.round(summary.avg_score)}%`} sub="across all assessments" accent />
          <Stat label="Avg Attendance" value={`${Math.round(summary.avg_attendance)}%`} sub="session attendance" />
          <Stat label="At-Risk Students" value={String(summary.at_risk_students)} sub="need attention" />
        </div>
      )}

      {!isLoading && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Students</th>
                  <th>Avg score</th>
                  <th>Attendance</th>
                  <th>Completion</th>
                  <th>At-risk</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">No course data available yet.</td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.id}>
                      <td style={{ fontWeight: 600 }}>{course.title}</td>
                      <td className="num">{course.students_count}</td>
                      <td className="num">{Math.round(course.avg_score)}%</td>
                      <td className="num">{Math.round(course.avg_attendance)}%</td>
                      <td className="num">{Math.round(course.completion_pct)}%</td>
                      <td
                        className="num"
                        style={{ color: course.at_risk_count > 0 ? 'var(--danger)' : 'var(--muted)' }}
                      >
                        {course.at_risk_count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
