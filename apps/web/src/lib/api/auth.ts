import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
    API_ROUTES.auth.me
  );
  return data.data.user;
};

export const loginWithPassword = async (
  email: string,
  password: string
): Promise<User> => {
  const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
    API_ROUTES.auth.login,
    { email, password }
  );
  return data.data.user;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post(API_ROUTES.auth.logout);
};

export const sendMagicLink = async (email: string): Promise<string> => {
  const { data } = await apiClient.post<{ message: string }>(
    API_ROUTES.auth.magicLink,
    { email }
  );
  return data.message;
};

export const verifyMagicLink = async (token: string): Promise<User> => {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
    API_ROUTES.auth.magicLinkVerify,
    { params: { token } }
  );
  return data.data.user;
};
