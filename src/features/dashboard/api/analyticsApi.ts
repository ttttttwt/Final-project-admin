import api from '@/lib/api';
import type { AnalyticsResponse } from '../types/analytics.types';

export const analyticsApi = {
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const response = await api.get<AnalyticsResponse>('/admin/analytics');
    return response.data;
  },
};
