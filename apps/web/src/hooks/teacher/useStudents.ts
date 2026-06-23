import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTeacherStudents, inviteStudent } from '@/lib/api/teacher';

export const teacherKeys = {
  students: ['teacher', 'students'] as const,
};

export function useTeacherStudents() {
  return useQuery({
    queryKey: teacherKeys.students,
    queryFn: fetchTeacherStudents,
  });
}

export function useInviteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.students });
    },
  });
}
