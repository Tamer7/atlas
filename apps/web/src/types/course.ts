export interface Instructor {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  tag: string;
  category: string;
  description?: string | null;
  glyph?: string | null;
  thumb_gradient: string;
  instructor: Instructor;
  lessons_total: number;
  lessons_done: number;
  progress: number;
}

export interface CourseDetail extends Course {
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  number: number;
  title: string;
  duration_seconds: number;
  status: 'done' | 'current' | 'locked' | 'available';
  has_quiz: boolean;
  is_locked: boolean;
}

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  color?: string;
  courses_count?: number;
  attendance_pct: number;
  avg_score: number;
  status: 'on_track' | 'at_risk' | 'excelling';
  last_active_at: string | null;
  flagged: boolean;
  score_trend: number[];
}

export interface CreateCoursePayload {
  title: string;
  tag: string;
  category: string;
  description?: string;
  glyph?: string;
  thumb_gradient?: string;
}
