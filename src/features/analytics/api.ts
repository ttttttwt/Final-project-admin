import api from '@/lib/api';
import type { AnalyticsResponse, OverviewStats, MonthlyStats, UserDistribution, AIUsageStats } from './types';

const BASE_URL = '/admin/analytics';

export const analyticsApi = {
  /**
   * Get complete analytics data
   */
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const response = await api.get<AnalyticsResponse>(BASE_URL);
    return response.data;
  },

  /**
   * Get overview stats only
   */
  getOverview: async (): Promise<OverviewStats> => {
    const response = await api.get<OverviewStats>(`${BASE_URL}/overview`);
    return response.data;
  },

  /**
   * Get monthly statistics
   */
  getMonthlyStats: async (months = 6): Promise<MonthlyStats[]> => {
    const response = await api.get<MonthlyStats[]>(`${BASE_URL}/monthly?months=${months}`);
    return response.data;
  },

  /**
   * Get user distribution
   */
  getUserDistribution: async (): Promise<UserDistribution> => {
    const response = await api.get<UserDistribution>(`${BASE_URL}/users`);
    return response.data;
  },

  /**
   * Get AI usage stats
   */
  getAIUsage: async (): Promise<AIUsageStats> => {
    const response = await api.get<AIUsageStats>(`${BASE_URL}/ai-usage`);
    return response.data;
  },
};

export default analyticsApi;
