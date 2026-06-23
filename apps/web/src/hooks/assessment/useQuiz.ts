import { useQuery } from '@tanstack/react-query';
import { fetchQuiz } from '@/lib/api/assessment';
import { quizKeys } from '@/hooks/assessment/useQuizzes';

export function useQuiz(id: string) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => fetchQuiz(id),
    enabled: !!id,
  });
}
