import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGradingQueue, gradeAnswer, completeGrading } from '@/lib/api/assessment';
import { attemptKeys } from '@/hooks/assessment/useAttempt';
import type { CompleteGradingPayload, GradeAnswerPayload } from '@/types/assessment';

export const gradingKeys = {
  queue: ['grading', 'queue'] as const,
};

export function useGradingQueue() {
  return useQuery({
    queryKey: gradingKeys.queue,
    queryFn: fetchGradingQueue,
  });
}

export function useGradeAnswer(attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      answerId,
      payload,
    }: {
      answerId: string;
      payload: GradeAnswerPayload;
    }) => gradeAnswer(attemptId, answerId, payload),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attemptId), attempt);
      queryClient.invalidateQueries({ queryKey: gradingKeys.queue });
    },
  });
}

export function useCompleteGrading(attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompleteGradingPayload = {}) => completeGrading(attemptId, payload),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attemptId), attempt);
      queryClient.invalidateQueries({ queryKey: gradingKeys.queue });
      queryClient.invalidateQueries({ queryKey: attemptKeys.results(attemptId) });
    },
  });
}
