'use client'
import { MOCK } from '@/lib/mock-data'
import { Stat } from '@/components/ui'

export default function ReportsPage() {
  const roster = MOCK.roster as readonly {
    id: string; name: string; courses: number; attendance: number;
    avgScore: number; status: string; last: string; flagged: boolean; color: string;
  }[]

  const totalStudents = roster.length
  const avgScore = Math.round(roster.reduce((sum, s) => sum + s.avgScore, 0) / roster.length)
  const avgAttendance = Math.round(roster.reduce((sum, s) => sum + s.attendance, 0) / roster.length)
  const atRisk = roster.filter(s => s.status === 'at-risk').length

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Assess</div>
          <h1 className="h1">Reports</h1>
        </div>
      </div>

      <div className="card card-pad-lg" style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
        <Stat label="Total Students" value={String(totalStudents)} sub="enrolled" />
        <Stat label="Avg Score" value={`${avgScore}%`} sub="across all assessments" accent />
        <Stat label="Avg Attendance" value={`${avgAttendance}%`} sub="session attendance" />
        <Stat label="At-Risk Students" value={String(atRisk)} sub="need attention" />
      </div>

      <div className="card card-pad-lg" style={{ textAlign: 'center', padding: 64, color: 'var(--muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Analytics coming soon</div>
        <div>Course performance charts and student progress reports will appear here.</div>
      </div>
    </div>
  )
}
