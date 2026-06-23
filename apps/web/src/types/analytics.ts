import type { GradingQueueItem } from './assessment';

export interface DashboardStats {
  active_students: number;
  courses_count: number;
  awaiting_grading: number;
  avg_class_score: number;
  avg_class_score_change: number | null;
  at_risk_students: number;
}

export interface TeacherDashboard {
  stats: DashboardStats;
  grading_queue: GradingQueueItem[];
}

export interface ReportsSummary {
  total_students: number;
  avg_score: number;
  avg_attendance: number;
  at_risk_students: number;
}

export interface CourseReport {
  id: string;
  title: string;
  students_count: number;
  avg_score: number;
  avg_attendance: number;
  completion_pct: number;
  at_risk_count: number;
}

export interface TeacherReports {
  summary: ReportsSummary;
  courses: CourseReport[];
}
