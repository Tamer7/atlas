import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchQuizzes,
  fetchTeacherQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '@/lib/api/assessment';
import type { CreateQuizPayload, UpdateQuizPayload } from '@/types/assessment';

export const quizKeys = {
  all: ['quizzes'] as const,
  teacher: ['quizzes', 'teacher'] as const,
  list: (courseId: string) => ['quizzes', courseId] as const,
  detail: (id: string) => ['quizzes', 'detail', id] as const,
};

export function useTeacherQuizzes() {
  return useQuery({
    queryKey: quizKeys.teacher,
    queryFn: fetchTeacherQuizzes,
  });
}

export function useQuizzes(courseId: string) {
  return useQuery({
    queryKey: quizKeys.list(courseId),
    queryFn: () => fetchQuizzes(courseId),
    enabled: !!courseId,
  });
}

export function useCreateQuiz(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuizPayload) => createQuiz(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.teacher });
    },
  });
}

export function useUpdateQuiz(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuizPayload }) =>
      updateQuiz(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.teacher });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(id) });
    },
  });
}

export function useDeleteQuiz(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.teacher });
    },
  });
}
