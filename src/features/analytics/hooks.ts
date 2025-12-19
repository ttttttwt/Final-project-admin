import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from './api';

const QUERY_KEYS = {
  analytics: ['admin', 'analytics'] as const,
  overview: ['admin', 'analytics', 'overview'] as const,
  monthly: ['admin', 'analytics', 'monthly'] as const,
  users: ['admin', 'analytics', 'users'] as const,
  aiUsage: ['admin', 'analytics', 'ai-usage'] as const,
};

export function useAnalytics() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics,
    queryFn: analyticsApi.getAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOverviewStats() {
  return useQuery({
    queryKey: QUERY_KEYS.overview,
    queryFn: analyticsApi.getOverview,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyStats(months = 6) {
  return useQuery({
    queryKey: [...QUERY_KEYS.monthly, months],
    queryFn: () => analyticsApi.getMonthlyStats(months),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserDistribution() {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: analyticsApi.getUserDistribution,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAIUsageStats() {
  return useQuery({
    queryKey: QUERY_KEYS.aiUsage,
    queryFn: analyticsApi.getAIUsage,
    staleTime: 5 * 60 * 1000,
  });
}
