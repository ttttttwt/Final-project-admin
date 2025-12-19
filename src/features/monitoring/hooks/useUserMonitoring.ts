import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userMonitoringApi } from '../api/userMonitoringApi';

// Query keys
const QUERY_KEYS = {
  activeUsers: ['admin', 'monitoring', 'activeUsers'] as const,
  userSessions: (userId: string) => ['admin', 'monitoring', 'sessions', userId] as const,
  userActivity: (userId: string) => ['admin', 'monitoring', 'activity', userId] as const,
  alerts: ['admin', 'monitoring', 'alerts'] as const,
};

/**
 * Hook for fetching active users overview
 */
export function useActiveUsers(limit: number = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.activeUsers, limit],
    queryFn: () => userMonitoringApi.getActiveUsers(limit),
    refetchInterval: 30000, // Polling every 30 seconds
  });
}

/**
 * Hook for fetching user session history
 */
export function useUserSessions(userId: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.userSessions(userId), page, size],
    queryFn: () => userMonitoringApi.getUserSessions(userId, page, size),
    enabled: !!userId,
  });
}

/**
 * Hook for fetching user activity history
 */
export function useUserActivity(userId: string, limit: number = 50) {
  return useQuery({
    queryKey: [...QUERY_KEYS.userActivity(userId), limit],
    queryFn: () => userMonitoringApi.getUserActivity(userId, limit),
    enabled: !!userId,
  });
}

/**
 * Hook for fetching abnormal activity alerts
 */
export function useAlerts() {
  return useQuery({
    queryKey: QUERY_KEYS.alerts,
    queryFn: () => userMonitoringApi.getAlerts(),
    refetchInterval: 60000, // Polling every minute
  });
}

/**
 * Hook for forcing user logout
 */
export function useForceLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userMonitoringApi.forceLogoutUser(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeUsers });
    },
  });
}
