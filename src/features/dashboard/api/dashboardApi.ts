import api from '@/lib/api';
import type { AdminDashboardStats } from '../types/dashboard.types';

export const dashboardApi = {
  getStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get<AdminDashboardStats>('/admin/dashboard');
    return response.data;
  },
};
