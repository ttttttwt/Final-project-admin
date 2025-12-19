import api from '@/lib/api';
import type {
  ActiveUsersDTO,
  PagedUserSessions,
  UserActivityDTO,
  AbnormalActivityAlertDTO,
} from '../types/userMonitoringTypes';

const BASE_URL = '/admin/monitoring/users';

/**
 * API functions for user monitoring
 */
export const userMonitoringApi = {
  /**
   * Get active users overview with device breakdown
   */
  getActiveUsers: async (limit: number = 20): Promise<ActiveUsersDTO> => {
    const response = await api.get<ActiveUsersDTO>(`${BASE_URL}/active`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get session history for a specific user
   */
  getUserSessions: async (
    userId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PagedUserSessions> => {
    const response = await api.get<PagedUserSessions>(`${BASE_URL}/${userId}/sessions`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get AI activity history for a specific user
   */
  getUserActivity: async (userId: string, limit: number = 50): Promise<UserActivityDTO> => {
    const response = await api.get<UserActivityDTO>(`${BASE_URL}/${userId}/activity`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get abnormal activity alerts
   */
  getAlerts: async (): Promise<AbnormalActivityAlertDTO[]> => {
    const response = await api.get<AbnormalActivityAlertDTO[]>(`${BASE_URL}/alerts`);
    return response.data;
  },

  /**
   * Force logout all sessions for a user
   */
  forceLogoutUser: async (userId: string): Promise<void> => {
    await api.post(`${BASE_URL}/${userId}/logout-all`);
  },
};

export default userMonitoringApi;
