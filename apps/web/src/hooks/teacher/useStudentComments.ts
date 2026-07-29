import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createStudentComment,
  deleteStudentComment,
  fetchStudentComments,
  updateStudentComment,
} from '@/lib/api/profile';
import type {
  CreateStudentCommentPayload,
  UpdateStudentCommentPayload,
} from '@/types/profile';

export const studentCommentKeys = {
  all: ['student-comments'] as const,
  forStudent: (studentId: string) => ['student-comments', studentId] as const,
};

export function useStudentComments(studentId: string) {
  return useQuery({
    queryKey: studentCommentKeys.forStudent(studentId),
    queryFn: () => fetchStudentComments(studentId),
    enabled: !!studentId,
  });
}

export function useCreateStudentComment(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentCommentPayload) =>
      createStudentComment(studentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentCommentKeys.forStudent(studentId) });
    },
  });
}

export function useUpdateStudentComment(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentCommentPayload }) =>
      updateStudentComment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentCommentKeys.forStudent(studentId) });
    },
  });
}

export function useDeleteStudentComment(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStudentComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentCommentKeys.forStudent(studentId) });
    },
  });
}
