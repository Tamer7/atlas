export interface ScheduleCourseRef {
  id: string;
  title: string;
  tag?: string | null;
  thumb_gradient?: string | null;
  glyph?: string | null;
}

export interface ScheduleSlot {
  id: string;
  course_id: string;
  /** ISO-8601 day: 1 = Monday … 7 = Sunday */
  day_of_week: number;
  /** "HH:MM" 24h */
  start_time: string;
  end_time: string;
  label: string | null;
  course?: ScheduleCourseRef;
}

export interface CreateScheduleSlotPayload {
  day_of_week: number;
  start_time: string;
  end_time: string;
  label?: string;
}

export interface UpdateScheduleSlotPayload {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  label?: string | null;
}

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export function dayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek - 1] ?? '';
}
