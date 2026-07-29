import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { ApiResponse } from '@/types/api';
import type {
  CreateDiscussionPostPayload,
  CreateLessonPayload,
  CreateModulePayload,
  DiscussionPost,
  LessonDetail,
  LessonNotesUpdate,
  LessonProgressUpdate,
  Module,
  UpdateLessonNotesPayload,
  UpdateLessonPayload,
  UpdateLessonProgressPayload,
  UpdateModulePayload,
} from '@/types/curriculum';

export const fetchModules = async (courseId: string): Promise<Module[]> => {
  const { data } = await apiClient.get<ApiResponse<Module[]>>(
    API_ROUTES.curriculum.modules(courseId)
  );
  return data.data;
};

export const createModule = async (
  courseId: string,
  payload: CreateModulePayload
): Promise<Module> => {
  const { data } = await apiClient.post<ApiResponse<Module>>(
    API_ROUTES.curriculum.createModule(courseId),
    payload
  );
  return data.data;
};

export const updateModule = async (
  id: string,
  payload: UpdateModulePayload
): Promise<Module> => {
  const { data } = await apiClient.patch<ApiResponse<Module>>(
    API_ROUTES.curriculum.updateModule(id),
    payload
  );
  return data.data;
};

export const deleteModule = async (id: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.curriculum.deleteModule(id));
};

export const createLesson = async (
  moduleId: string,
  payload: CreateLessonPayload
): Promise<LessonDetail> => {
  const { data } = await apiClient.post<ApiResponse<LessonDetail>>(
    API_ROUTES.curriculum.createLesson(moduleId),
    payload
  );
  return data.data;
};

export const fetchLesson = async (id: string): Promise<LessonDetail> => {
  const { data } = await apiClient.get<ApiResponse<LessonDetail>>(
    API_ROUTES.curriculum.lesson(id)
  );
  return data.data;
};

export const updateLesson = async (
  id: string,
  payload: UpdateLessonPayload
): Promise<LessonDetail> => {
  const { data } = await apiClient.patch<ApiResponse<LessonDetail>>(
    API_ROUTES.curriculum.updateLesson(id),
    payload
  );
  return data.data;
};

export const deleteLesson = async (id: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.curriculum.deleteLesson(id));
};

export const uploadLessonVideo = async (
  id: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<LessonDetail> => {
  const form = new FormData();
  form.append('video', file);

  const { data } = await apiClient.post<ApiResponse<LessonDetail>>(
    API_ROUTES.curriculum.uploadLessonVideo(id),
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    }
  );
  return data.data;
};

export const updateLessonProgress = async (
  id: string,
  payload: UpdateLessonProgressPayload
): Promise<LessonProgressUpdate> => {
  const { data } = await apiClient.post<ApiResponse<LessonProgressUpdate>>(
    API_ROUTES.curriculum.lessonProgress(id),
    payload
  );
  return data.data;
};

export const updateLessonNotes = async (
  id: string,
  payload: UpdateLessonNotesPayload
): Promise<LessonNotesUpdate> => {
  const { data } = await apiClient.patch<ApiResponse<LessonNotesUpdate>>(
    API_ROUTES.curriculum.lessonNotes(id),
    payload
  );
  return data.data;
};

export const fetchDiscussion = async (lessonId: string): Promise<DiscussionPost[]> => {
  const { data } = await apiClient.get<ApiResponse<DiscussionPost[]>>(
    API_ROUTES.curriculum.discussion(lessonId)
  );
  return data.data;
};

export const createDiscussionPost = async (
  lessonId: string,
  payload: CreateDiscussionPostPayload
): Promise<DiscussionPost> => {
  const { data } = await apiClient.post<ApiResponse<DiscussionPost>>(
    API_ROUTES.curriculum.discussion(lessonId),
    payload
  );
  return data.data;
};
