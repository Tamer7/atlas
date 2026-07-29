import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { ApiResponse } from '@/types/api';
import type {
  CreateStudentCommentPayload,
  DueAssignment,
  Grade,
  StudentComment,
  UpdateStudentCommentPayload,
} from '@/types/profile';

export const fetchMyGrades = async (): Promise<Grade[]> => {
  const { data } = await apiClient.get<ApiResponse<Grade[]>>(API_ROUTES.profile.grades);
  return data.data;
};

export const fetchDueAssignments = async (): Promise<DueAssignment[]> => {
  const { data } = await apiClient.get<ApiResponse<DueAssignment[]>>(
    API_ROUTES.profile.dueAssignments
  );
  return data.data;
};

export const fetchMyComments = async (): Promise<StudentComment[]> => {
  const { data } = await apiClient.get<ApiResponse<StudentComment[]>>(
    API_ROUTES.profile.myComments
  );
  return data.data;
};

export const fetchStudentComments = async (studentId: string): Promise<StudentComment[]> => {
  const { data } = await apiClient.get<ApiResponse<StudentComment[]>>(
    API_ROUTES.profile.studentComments(studentId)
  );
  return data.data;
};

export const createStudentComment = async (
  studentId: string,
  payload: CreateStudentCommentPayload
): Promise<StudentComment> => {
  const { data } = await apiClient.post<ApiResponse<StudentComment>>(
    API_ROUTES.profile.studentComments(studentId),
    payload
  );
  return data.data;
};

export const updateStudentComment = async (
  id: string,
  payload: UpdateStudentCommentPayload
): Promise<StudentComment> => {
  const { data } = await apiClient.patch<ApiResponse<StudentComment>>(
    API_ROUTES.profile.comment(id),
    payload
  );
  return data.data;
};

export const deleteStudentComment = async (id: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.profile.comment(id));
};
