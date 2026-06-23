import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
} from '@/lib/api/curriculum';
import { courseKeys } from '@/hooks/courses/useCourses';
import type { CreateModulePayload, UpdateModulePayload } from '@/types/curriculum';

export const curriculumKeys = {
  all: ['curriculum'] as const,
  modules: (courseId: string) => ['curriculum', 'modules', courseId] as const,
};

export function useModules(courseId: string) {
  return useQuery({
    queryKey: curriculumKeys.modules(courseId),
    queryFn: () => fetchModules(courseId),
    enabled: !!courseId,
  });
}

export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateModulePayload) => createModule(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.modules(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateModulePayload }) =>
      updateModule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.modules(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.modules(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}
