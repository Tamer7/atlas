import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createScheduleSlot,
  deleteScheduleSlot,
  fetchCourseSchedule,
  fetchMySchedule,
  updateScheduleSlot,
} from '@/lib/api/schedule';
import type {
  CreateScheduleSlotPayload,
  UpdateScheduleSlotPayload,
} from '@/types/schedule';

export const scheduleKeys = {
  all: ['schedule'] as const,
  course: (courseId: string) => ['schedule', 'course', courseId] as const,
  mine: ['schedule', 'mine'] as const,
};

export function useCourseSchedule(courseId: string) {
  return useQuery({
    queryKey: scheduleKeys.course(courseId),
    queryFn: () => fetchCourseSchedule(courseId),
    enabled: !!courseId,
  });
}

export function useMySchedule() {
  return useQuery({
    queryKey: scheduleKeys.mine,
    queryFn: fetchMySchedule,
  });
}

export function useCreateScheduleSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: CreateScheduleSlotPayload }) =>
      createScheduleSlot(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useUpdateScheduleSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateScheduleSlotPayload }) =>
      updateScheduleSlot(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useDeleteScheduleSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteScheduleSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
