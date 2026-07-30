import { apiClient } from '@/lib/api/client';
import { API_ROUTES } from '@/lib/api/routes';
import type { ApiResponse } from '@/types/api';
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserFilters,
  AdminUserPage,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/types/admin';

export async function fetchAdminUsers(filters: AdminUserFilters): Promise<AdminUserPage> {
  const { data } = await apiClient.get<ApiResponse<AdminUser[]>>(API_ROUTES.admin.users, {
    params: {
      search: filters.search || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    },
  });
  const total = typeof data.meta?.total === 'number' ? data.meta.total : data.data.length;
  return { users: data.data, total };
}

export async function fetchAdminUser(id: string): Promise<AdminUserDetail> {
  const { data } = await apiClient.get<ApiResponse<AdminUserDetail>>(
    API_ROUTES.admin.user(id)
  );
  return data.data;
}

export async function createAdminUser(
  payload: CreateAdminUserPayload
): Promise<ApiResponse<AdminUser | null>> {
  const { data } = await apiClient.post<ApiResponse<AdminUser | null>>(
    API_ROUTES.admin.users,
    payload
  );
  return data;
}

export async function updateAdminUser(
  id: string,
  payload: UpdateAdminUserPayload
): Promise<AdminUser> {
  const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
    API_ROUTES.admin.user(id),
    payload
  );
  return data.data;
}

export async function deactivateUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.post<ApiResponse<AdminUser>>(
    API_ROUTES.admin.deactivate(id)
  );
  return data.data;
}

export async function reactivateUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.post<ApiResponse<AdminUser>>(
    API_ROUTES.admin.reactivate(id)
  );
  return data.data;
}

export async function sendPasswordReset(id: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    API_ROUTES.admin.passwordReset(id)
  );
  return data;
}
