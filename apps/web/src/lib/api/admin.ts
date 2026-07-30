import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserFilters,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/types/admin';

export async function fetchAdminUsers(filters: AdminUserFilters): Promise<AdminUser[]> {
  const { data } = await apiClient.get<ApiResponse<AdminUser[]>>('/api/v1/admin/users', {
    params: {
      search: filters.search || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    },
  });
  return data.data;
}

export async function fetchAdminUser(id: string): Promise<AdminUserDetail> {
  const { data } = await apiClient.get<ApiResponse<AdminUserDetail>>(
    `/api/v1/admin/users/${id}`
  );
  return data.data;
}

export async function createAdminUser(
  payload: CreateAdminUserPayload
): Promise<ApiResponse<AdminUser | null>> {
  const { data } = await apiClient.post<ApiResponse<AdminUser | null>>(
    '/api/v1/admin/users',
    payload
  );
  return data;
}

export async function updateAdminUser(
  id: string,
  payload: UpdateAdminUserPayload
): Promise<AdminUser> {
  const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
    `/api/v1/admin/users/${id}`,
    payload
  );
  return data.data;
}

export async function deactivateUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.post<ApiResponse<AdminUser>>(
    `/api/v1/admin/users/${id}/deactivate`
  );
  return data.data;
}

export async function reactivateUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.post<ApiResponse<AdminUser>>(
    `/api/v1/admin/users/${id}/reactivate`
  );
  return data.data;
}

export async function sendPasswordReset(id: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    `/api/v1/admin/users/${id}/password-reset`
  );
  return data;
}
