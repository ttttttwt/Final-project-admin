import api from '@/lib/api';
import type {
  SubscriptionPlanDTO,
  PromoCodeDTO,
  CreatePlanRequest,
  CreatePromoCodeRequest,
  SubscriptionStats,
  PagedPromoCodes,
} from './types';

const BASE_URL = '/admin/subscriptions';

/**
 * API functions for subscription management
 */
export const subscriptionApi = {
  // ========== Plans ==========
  
  getAllPlans: async (): Promise<SubscriptionPlanDTO[]> => {
    const response = await api.get<SubscriptionPlanDTO[]>(`${BASE_URL}/plans`);
    return response.data;
  },

  getEffectivePlans: async (): Promise<SubscriptionPlanDTO[]> => {
    const response = await api.get<SubscriptionPlanDTO[]>(`${BASE_URL}/plans/effective`);
    return response.data;
  },

  getPlan: async (id: string): Promise<SubscriptionPlanDTO> => {
    const response = await api.get<SubscriptionPlanDTO>(`${BASE_URL}/plans/${id}`);
    return response.data;
  },

  createPlan: async (data: CreatePlanRequest): Promise<SubscriptionPlanDTO> => {
    const response = await api.post<SubscriptionPlanDTO>(`${BASE_URL}/plans`, data);
    return response.data;
  },

  updatePlan: async (id: string, updates: Partial<SubscriptionPlanDTO>): Promise<SubscriptionPlanDTO> => {
    const response = await api.put<SubscriptionPlanDTO>(`${BASE_URL}/plans/${id}`, updates);
    return response.data;
  },

  togglePlanActive: async (id: string, isActive: boolean): Promise<void> => {
    await api.patch(`${BASE_URL}/plans/${id}/active?isActive=${isActive}`);
  },

  // ========== Promo Codes ==========

  getPromoCodes: async (page = 0, size = 10, search?: string): Promise<PagedPromoCodes> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.append('search', search);
    const response = await api.get<PagedPromoCodes>(`${BASE_URL}/promo-codes?${params}`);
    return response.data;
  },

  getValidPromoCodes: async (): Promise<PromoCodeDTO[]> => {
    const response = await api.get<PromoCodeDTO[]>(`${BASE_URL}/promo-codes/valid`);
    return response.data;
  },

  getPromoCode: async (id: string): Promise<PromoCodeDTO> => {
    const response = await api.get<PromoCodeDTO>(`${BASE_URL}/promo-codes/${id}`);
    return response.data;
  },

  createPromoCode: async (data: CreatePromoCodeRequest): Promise<PromoCodeDTO> => {
    const response = await api.post<PromoCodeDTO>(`${BASE_URL}/promo-codes`, data);
    return response.data;
  },

  updatePromoCode: async (id: string, updates: Partial<PromoCodeDTO>): Promise<PromoCodeDTO> => {
    const response = await api.put<PromoCodeDTO>(`${BASE_URL}/promo-codes/${id}`, updates);
    return response.data;
  },

  deactivatePromoCode: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/promo-codes/${id}`);
  },

  validatePromoCode: async (code: string, planType: string): Promise<PromoCodeDTO> => {
    const response = await api.get<PromoCodeDTO>(
      `${BASE_URL}/promo-codes/validate?code=${code}&planType=${planType}`
    );
    return response.data;
  },

  // ========== Stats ==========

  getStats: async (): Promise<SubscriptionStats> => {
    const response = await api.get<SubscriptionStats>(`${BASE_URL}/stats`);
    return response.data;
  },
};

export default subscriptionApi;
