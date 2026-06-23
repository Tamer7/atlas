import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCourses, fetchCourse, createCourse } from '@/lib/api/courses';
import type { CreateCoursePayload } from '@/types/course';

export const courseKeys = {
  all: ['courses'] as const,
  detail: (id: string) => ['courses', id] as const,
};

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: fetchCourses,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => fetchCourse(id),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
