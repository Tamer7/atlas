import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminUser,
  deactivateUser,
  fetchAdminUser,
  fetchAdminUsers,
  reactivateUser,
  sendPasswordReset,
  updateAdminUser,
} from '@/lib/api/admin';
import type {
  AdminUserFilters,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/types/admin';

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (filters: AdminUserFilters) => ['admin', 'users', filters] as const,
  detail: (id: string) => ['admin', 'users', id] as const,
};

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => fetchAdminUsers(filters),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => fetchAdminUser(id),
    enabled: !!id,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
}

export function useCreateAdminUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminUser(id: string) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (payload: UpdateAdminUserPayload) => updateAdminUser(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeactivateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: deactivateUser, onSuccess: invalidate });
}

export function useReactivateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: reactivateUser, onSuccess: invalidate });
}

export function useSendPasswordReset() {
  return useMutation({ mutationFn: sendPasswordReset });
}
