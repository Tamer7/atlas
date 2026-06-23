import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { ApiResponse } from '@/types/api';
import type { TeacherDashboard, TeacherReports } from '@/types/analytics';

export const fetchDashboard = async (): Promise<TeacherDashboard> => {
  const { data } = await apiClient.get<ApiResponse<TeacherDashboard>>(
    API_ROUTES.analytics.dashboard
  );
  return data.data;
};

export const fetchReports = async (): Promise<TeacherReports> => {
  const { data } = await apiClient.get<ApiResponse<TeacherReports>>(
    API_ROUTES.analytics.reports
  );
  return data.data;
};
