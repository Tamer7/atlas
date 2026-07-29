export interface ProfileCourseRef {
  id: string;
  title: string;
  tag?: string | null;
}

export type AttemptStatus = 'in_progress' | 'submitted' | 'graded';

export interface Grade {
  id: string;
  quiz_id: string;
  status: AttemptStatus;
  submitted_at: string | null;
  total_score: number | null;
  quiz?: {
    id: string;
    title: string;
    quiz_type: string;
    passing_score: number;
  };
  course?: ProfileCourseRef;
}

export interface DueAssignment {
  id: string;
  title: string;
  quiz_type: string;
  due_at: string | null;
  questions_count: number;
  attempt_status: AttemptStatus | null;
  course?: ProfileCourseRef;
}

export interface StudentComment {
  id: string;
  student_id: string;
  body: string;
  created_at: string | null;
  updated_at: string | null;
  teacher?: {
    id: string;
    name: string;
  };
  course?: ProfileCourseRef | null;
}

export interface CreateStudentCommentPayload {
  body: string;
  course_id?: string;
}

export interface UpdateStudentCommentPayload {
  body: string;
}
