import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { ApiResponse } from '@/types/api';
import type {
  CreateScheduleSlotPayload,
  ScheduleSlot,
  UpdateScheduleSlotPayload,
} from '@/types/schedule';

export const fetchCourseSchedule = async (courseId: string): Promise<ScheduleSlot[]> => {
  const { data } = await apiClient.get<ApiResponse<ScheduleSlot[]>>(
    API_ROUTES.schedule.forCourse(courseId)
  );
  return data.data;
};

export const fetchMySchedule = async (): Promise<ScheduleSlot[]> => {
  const { data } = await apiClient.get<ApiResponse<ScheduleSlot[]>>(API_ROUTES.schedule.mine);
  return data.data;
};

export const createScheduleSlot = async (
  courseId: string,
  payload: CreateScheduleSlotPayload
): Promise<ScheduleSlot> => {
  const { data } = await apiClient.post<ApiResponse<ScheduleSlot>>(
    API_ROUTES.schedule.createSlot(courseId),
    payload
  );
  return data.data;
};

export const updateScheduleSlot = async (
  id: string,
  payload: UpdateScheduleSlotPayload
): Promise<ScheduleSlot> => {
  const { data } = await apiClient.patch<ApiResponse<ScheduleSlot>>(
    API_ROUTES.schedule.updateSlot(id),
    payload
  );
  return data.data;
};

export const deleteScheduleSlot = async (id: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.schedule.deleteSlot(id));
};
