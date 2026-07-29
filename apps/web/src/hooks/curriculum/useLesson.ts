import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonVideo,
  fetchDiscussion,
  createDiscussionPost,
} from '@/lib/api/curriculum';
import { curriculumKeys } from '@/hooks/curriculum/useModules';
import { courseKeys } from '@/hooks/courses/useCourses';
import type {
  CreateDiscussionPostPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
} from '@/types/curriculum';

export const lessonKeys = {
  all: ['lessons'] as const,
  detail: (id: string) => ['lessons', id] as const,
  discussion: (id: string) => ['lessons', id, 'discussion'] as const,
};

export function useLesson(id: string) {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: () => fetchLesson(id),
    enabled: !!id,
  });
}

export function useCreateLesson(moduleId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLessonPayload) => createLesson(moduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.modules(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLessonPayload }) =>
      updateLesson(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.modules(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useUploadLessonVideo(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      file,
      onProgress,
    }: {
      id: string;
      file: File;
      onProgress?: (pct: number) => void;
    }) => uploadLessonVideo(id, file, onProgress),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.modules(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.modules(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useDiscussion(lessonId: string) {
  return useQuery({
    queryKey: lessonKeys.discussion(lessonId),
    queryFn: () => fetchDiscussion(lessonId),
    enabled: !!lessonId,
  });
}

export function useCreateDiscussionPost(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDiscussionPostPayload) =>
      createDiscussionPost(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.discussion(lessonId) });
    },
  });
}
