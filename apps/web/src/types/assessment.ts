export type QuizType = 'graded' | 'practice' | 'survey';
export type ShowResults = 'after' | 'manual' | 'never';
export type AttemptStatus = 'in_progress' | 'submitted' | 'graded';
export type QuestionType =
  | 'mcq'
  | 'tf'
  | 'fib'
  | 'short'
  | 'match'
  | 'essay'
  | 'code'
  | 'upload';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  config: Record<string, unknown>;
  sort_order: number;
}

export interface QuizListItem {
  id: string;
  course_id: string;
  course_title?: string;
  title: string;
  quiz_type: QuizType;
  questions_count: number;
  published_at: string | null;
  updated_at: string | null;
}

export interface Quiz {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  quiz_type: QuizType;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  shuffle_questions: boolean;
  show_results: ShowResults;
  passing_score: number | null;
  show_correct: boolean;
  show_score: boolean;
  published_at: string | null;
  created_by: string | null;
  questions_count?: number;
  questions?: QuizQuestion[];
  created_at: string | null;
  updated_at: string | null;
}

export interface AttemptUser {
  id: string;
  name: string;
}

export interface AttemptAnswer {
  id: string;
  question_id: string;
  answer: Record<string, unknown> | null;
  auto_score: number | null;
  manual_score: number | null;
  feedback: string | null;
  question: QuizQuestion | null;
}

export interface Attempt {
  id: string;
  quiz_id: string;
  user_id: string;
  status: AttemptStatus;
  started_at: string | null;
  submitted_at: string | null;
  auto_score?: number | null;
  manual_score?: number | null;
  total_score?: number | null;
  overall_feedback?: string | null;
  quiz?: Quiz;
  user?: AttemptUser;
  answers?: AttemptAnswer[];
}

export interface GradingQueueStudent {
  id: string;
  name: string;
}

export interface GradingQueueAnswer {
  id: string;
  question_id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  answer: Record<string, unknown> | null;
}

export interface GradingQueueItem {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  course_id: string;
  course_title: string;
  student: GradingQueueStudent;
  submitted_at: string | null;
  pending_count: number;
  answers: GradingQueueAnswer[];
}

export interface CreateQuizQuestionPayload {
  type: QuestionType;
  prompt: string;
  points?: number;
  config?: Record<string, unknown>;
  sort_order?: number;
}

export interface CreateQuizPayload {
  title: string;
  lesson_id?: string;
  quiz_type?: QuizType;
  time_limit_minutes?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  show_results?: ShowResults;
  passing_score?: number;
  show_correct?: boolean;
  show_score?: boolean;
  publish?: boolean;
  questions: CreateQuizQuestionPayload[];
}

export interface UpdateQuizPayload {
  title?: string;
  lesson_id?: string | null;
  quiz_type?: QuizType;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  shuffle_questions?: boolean;
  show_results?: ShowResults;
  passing_score?: number | null;
  show_correct?: boolean;
  show_score?: boolean;
  publish?: boolean;
  questions?: CreateQuizQuestionPayload[];
}

export interface SaveAnswerPayload {
  question_id: string;
  answer: Record<string, unknown> | null;
}

export interface SaveAnswersPayload {
  answers: SaveAnswerPayload[];
}

export interface GradeAnswerPayload {
  score: number;
  feedback?: string;
}

export interface CompleteGradingPayload {
  overall_feedback?: string;
}
