import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '@/lib/api/analytics';

export const analyticsKeys = {
  dashboard: ['analytics', 'dashboard'] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: analyticsKeys.dashboard,
    queryFn: fetchDashboard,
  });
}
