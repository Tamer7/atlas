export type AdminRole = 'student' | 'teacher' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  courses: { id: string; title: string }[];
  enrollments: { id: string; course_id: string; enrolled_at: string | null }[];
}

export interface AdminUserFilters {
  search?: string;
  role?: AdminRole | '';
  status?: 'active' | 'inactive' | '';
}

export type CreateAdminUserPayload =
  | { mode: 'invite'; email: string; role: AdminRole }
  | { mode: 'password'; name: string; email: string; role: AdminRole; password: string };

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  role?: AdminRole;
}
