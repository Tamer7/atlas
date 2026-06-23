import { apiClient } from './client';
import { API_ROUTES } from './routes';
import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';

export const acceptInvitation = async (token: string): Promise<User> => {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
    API_ROUTES.invitations.accept,
    { params: { token } }
  );
  return data.data.user;
};
