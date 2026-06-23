export type LessonStatus = 'done' | 'current' | 'locked' | 'available';
export type ContentType = 'text' | 'video' | 'quiz';

export interface Lesson {
  id: string;
  number: number;
  title: string;
  duration_seconds: number;
  status: LessonStatus;
  has_quiz: boolean;
  quiz_id?: string | null;
  content_type?: ContentType;
  is_locked: boolean;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface LessonProgress {
  position_seconds: number;
  completed_at: string | null;
  notes: string | null;
}

export interface LessonChapter {
  id?: string;
  n?: number;
  title: string;
  time?: string;
  t?: number;
  done?: boolean;
  current?: boolean;
}

export interface TranscriptLine {
  t: string;
  speaker: string;
  text: string;
}

export interface LessonAttachment {
  name: string;
  url: string;
  type?: string;
}

export interface LessonDetail {
  id: string;
  module_id: string;
  number: number;
  title: string;
  duration_seconds: number;
  content_type: ContentType;
  body: string | null;
  video_url: string | null;
  chapters: LessonChapter[] | null;
  transcript: TranscriptLine[] | null;
  attachments: LessonAttachment[] | null;
  quiz_id: string | null;
  progress: LessonProgress | null;
}

export interface DiscussionUser {
  id: string;
  name: string;
  color?: string | null;
}

export interface DiscussionPost {
  id: string;
  body: string;
  created_at: string | null;
  user: DiscussionUser;
  replies?: DiscussionPost[];
}

export interface CreateModulePayload {
  title: string;
  sort_order?: number;
}

export interface UpdateModulePayload {
  title?: string;
  sort_order?: number;
}

export interface CreateLessonPayload {
  title: string;
  number?: number;
  duration_seconds?: number;
  sort_order?: number;
  content_type?: ContentType;
  body?: string;
  video_url?: string;
  chapters?: LessonChapter[];
  transcript?: TranscriptLine[];
  attachments?: LessonAttachment[];
  quiz_id?: string;
}

export interface UpdateLessonPayload {
  title?: string;
  number?: number;
  duration_seconds?: number;
  sort_order?: number;
  content_type?: ContentType;
  body?: string | null;
  video_url?: string | null;
  chapters?: LessonChapter[] | null;
  transcript?: TranscriptLine[] | null;
  attachments?: LessonAttachment[] | null;
  quiz_id?: string | null;
}

export interface UpdateLessonProgressPayload {
  position_seconds?: number;
  completed?: boolean;
}

export interface UpdateLessonNotesPayload {
  notes: string;
}

export interface LessonProgressUpdate {
  position_seconds: number;
  completed_at: string | null;
}

export interface LessonNotesUpdate {
  notes: string | null;
}

export interface CreateDiscussionPostPayload {
  body: string;
  parent_id?: string;
}
