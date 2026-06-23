import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { ApiResponse } from '@/types/api';
import type {
  Attempt,
  CompleteGradingPayload,
  CreateQuizPayload,
  GradeAnswerPayload,
  GradingQueueItem,
  Quiz,
  QuizListItem,
  SaveAnswersPayload,
  UpdateQuizPayload,
} from '@/types/assessment';

export const fetchTeacherQuizzes = async (): Promise<QuizListItem[]> => {
  const { data } = await apiClient.get<ApiResponse<QuizListItem[]>>(
    API_ROUTES.assessment.teacherQuizzes
  );
  return data.data;
};

export const fetchQuizzes = async (courseId: string): Promise<Quiz[]> => {
  const { data } = await apiClient.get<ApiResponse<Quiz[]>>(
    API_ROUTES.assessment.quizzes(courseId)
  );
  return data.data;
};

export const fetchQuiz = async (id: string): Promise<Quiz> => {
  const { data } = await apiClient.get<ApiResponse<Quiz>>(API_ROUTES.assessment.quiz(id));
  return data.data;
};

export const createQuiz = async (
  courseId: string,
  payload: CreateQuizPayload
): Promise<Quiz> => {
  const { data } = await apiClient.post<ApiResponse<Quiz>>(
    API_ROUTES.assessment.createQuiz(courseId),
    payload
  );
  return data.data;
};

export const updateQuiz = async (id: string, payload: UpdateQuizPayload): Promise<Quiz> => {
  const { data } = await apiClient.patch<ApiResponse<Quiz>>(
    API_ROUTES.assessment.updateQuiz(id),
    payload
  );
  return data.data;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.assessment.deleteQuiz(id));
};

export const startAttempt = async (quizId: string): Promise<Attempt> => {
  const { data } = await apiClient.post<ApiResponse<Attempt>>(
    API_ROUTES.assessment.startAttempt(quizId)
  );
  return data.data;
};

export const fetchAttempt = async (id: string): Promise<Attempt> => {
  const { data } = await apiClient.get<ApiResponse<Attempt>>(API_ROUTES.assessment.attempt(id));
  return data.data;
};

export const saveAnswers = async (
  id: string,
  payload: SaveAnswersPayload
): Promise<Attempt> => {
  const { data } = await apiClient.patch<ApiResponse<Attempt>>(
    API_ROUTES.assessment.saveAnswers(id),
    payload
  );
  return data.data;
};

export const submitAttempt = async (id: string): Promise<Attempt> => {
  const { data } = await apiClient.post<ApiResponse<Attempt>>(
    API_ROUTES.assessment.submitAttempt(id)
  );
  return data.data;
};

export const fetchAttemptResults = async (id: string): Promise<Attempt> => {
  const { data } = await apiClient.get<ApiResponse<Attempt>>(
    API_ROUTES.assessment.attemptResults(id)
  );
  return data.data;
};

export const fetchGradingQueue = async (): Promise<GradingQueueItem[]> => {
  const { data } = await apiClient.get<ApiResponse<GradingQueueItem[]>>(
    API_ROUTES.assessment.gradingQueue
  );
  return data.data;
};

export const gradeAnswer = async (
  attemptId: string,
  answerId: string,
  payload: GradeAnswerPayload
): Promise<Attempt> => {
  const { data } = await apiClient.patch<ApiResponse<Attempt>>(
    API_ROUTES.assessment.gradeAnswer(attemptId, answerId),
    payload
  );
  return data.data;
};

export const completeGrading = async (
  attemptId: string,
  payload: CompleteGradingPayload = {}
): Promise<Attempt> => {
  const { data } = await apiClient.post<ApiResponse<Attempt>>(
    API_ROUTES.assessment.completeGrading(attemptId),
    payload
  );
  return data.data;
};
