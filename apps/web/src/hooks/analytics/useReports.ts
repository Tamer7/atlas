import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '@/lib/api/analytics';

export const analyticsKeys = {
  reports: ['analytics', 'reports'] as const,
};

export function useReports() {
  return useQuery({
    queryKey: analyticsKeys.reports,
    queryFn: fetchReports,
  });
}
