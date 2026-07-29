import { useQuery } from '@tanstack/react-query';
import { fetchDueAssignments, fetchMyComments, fetchMyGrades } from '@/lib/api/profile';

export const profileKeys = {
  all: ['profile'] as const,
  grades: ['profile', 'grades'] as const,
  dueAssignments: ['profile', 'due-assignments'] as const,
  comments: ['profile', 'comments'] as const,
};

export function useMyGrades() {
  return useQuery({
    queryKey: profileKeys.grades,
    queryFn: fetchMyGrades,
  });
}

export function useDueAssignments() {
  return useQuery({
    queryKey: profileKeys.dueAssignments,
    queryFn: fetchDueAssignments,
  });
}

export function useMyComments() {
  return useQuery({
    queryKey: profileKeys.comments,
    queryFn: fetchMyComments,
  });
}
