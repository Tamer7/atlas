import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { TeacherStudent } from '@/types/course';
import type { ApiResponse } from '@/types/api';

export const fetchTeacherStudents = async (): Promise<TeacherStudent[]> => {
  const { data } = await apiClient.get<ApiResponse<TeacherStudent[]>>(
    API_ROUTES.teacher.students
  );
  return data.data;
};

export const inviteStudent = async (payload: {
  email: string;
  course_ids: string[];
}): Promise<void> => {
  await apiClient.post(API_ROUTES.teacher.invite, payload);
};

export const addStudentToCourse = async (
  courseId: string,
  email: string
): Promise<TeacherStudent> => {
  const { data } = await apiClient.post<ApiResponse<TeacherStudent>>(
    API_ROUTES.teacher.addStudent(courseId),
    { email }
  );
  return data.data;
};
