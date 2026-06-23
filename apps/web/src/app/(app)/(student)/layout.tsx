import { RoleGuard } from '@/components/auth/RoleGuard';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard require="student" redirectTo="/teacher">
      {children}
    </RoleGuard>
  );
}
