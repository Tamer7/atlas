import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLessonProgress, updateLessonNotes } from '@/lib/api/curriculum';
import { lessonKeys } from '@/hooks/curriculum/useLesson';
import { courseKeys } from '@/hooks/courses/useCourses';
import type { UpdateLessonNotesPayload, UpdateLessonProgressPayload } from '@/types/curriculum';

export function useUpdateLessonProgress(lessonId: string, courseId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLessonProgressPayload) =>
      updateLessonProgress(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      }
    },
  });
}

export function useUpdateLessonNotes(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLessonNotesPayload) => updateLessonNotes(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
    },
  });
}
