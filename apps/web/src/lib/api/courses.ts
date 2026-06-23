import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { Course, CourseDetail, CreateCoursePayload } from '@/types/course';
import type { ApiResponse } from '@/types/api';

export const fetchCourses = async (): Promise<Course[]> => {
  const { data } = await apiClient.get<ApiResponse<Course[]>>(API_ROUTES.courses.list);
  return data.data;
};

export const fetchCourse = async (id: string): Promise<CourseDetail> => {
  const { data } = await apiClient.get<ApiResponse<CourseDetail>>(
    API_ROUTES.courses.detail(id)
  );
  return data.data;
};

export const createCourse = async (payload: CreateCoursePayload): Promise<Course> => {
  const { data } = await apiClient.post<ApiResponse<Course>>(
    API_ROUTES.courses.create,
    payload
  );
  return data.data;
};

export const updateCourse = async (
  id: string,
  payload: Partial<CreateCoursePayload>
): Promise<Course> => {
  const { data } = await apiClient.patch<ApiResponse<Course>>(
    API_ROUTES.courses.update(id),
    payload
  );
  return data.data;
};
