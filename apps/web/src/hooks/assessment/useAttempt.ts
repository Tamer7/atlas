import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startAttempt,
  fetchAttempt,
  saveAnswers,
  submitAttempt,
  fetchAttemptResults,
} from '@/lib/api/assessment';
import type { SaveAnswersPayload } from '@/types/assessment';

export const attemptKeys = {
  all: ['attempts'] as const,
  detail: (id: string) => ['attempts', id] as const,
  results: (id: string) => ['attempts', id, 'results'] as const,
};

export function useAttempt(id: string) {
  return useQuery({
    queryKey: attemptKeys.detail(id),
    queryFn: () => fetchAttempt(id),
    enabled: !!id,
  });
}

export function useAttemptResults(id: string) {
  return useQuery({
    queryKey: attemptKeys.results(id),
    queryFn: () => fetchAttemptResults(id),
    enabled: !!id,
  });
}

export function useStartAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => startAttempt(quizId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attempt.id), attempt);
    },
  });
}

export function useSaveAnswers(attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveAnswersPayload) => saveAnswers(attemptId, payload),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attemptId), attempt);
    },
  });
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitAttempt(attemptId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attemptId), attempt);
      queryClient.invalidateQueries({ queryKey: attemptKeys.results(attemptId) });
    },
  });
}
