import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from './api';
import type { CreatePlanRequest, CreatePromoCodeRequest, SubscriptionPlanDTO, PromoCodeDTO } from './types';

// Query keys
const QUERY_KEYS = {
  plans: ['admin', 'subscriptions', 'plans'] as const,
  effectivePlans: ['admin', 'subscriptions', 'plans', 'effective'] as const,
  promoCodes: ['admin', 'subscriptions', 'promo-codes'] as const,
  validPromoCodes: ['admin', 'subscriptions', 'promo-codes', 'valid'] as const,
  payments: ['admin', 'payments'] as const,
  stats: ['admin', 'subscriptions', 'stats'] as const,
};

// ========== Plans Hooks ==========

export function usePlans() {
  return useQuery({
    queryKey: QUERY_KEYS.plans,
    queryFn: subscriptionApi.getAllPlans,
  });
}

export function useEffectivePlans() {
  return useQuery({
    queryKey: QUERY_KEYS.effectivePlans,
    queryFn: subscriptionApi.getEffectivePlans,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => subscriptionApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.plans });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SubscriptionPlanDTO> }) => 
      subscriptionApi.updatePlan(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.plans });
    },
  });
}

export function useTogglePlanActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      subscriptionApi.togglePlanActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.plans });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

// ========== Promo Codes Hooks ==========

export function usePromoCodes(page = 0, size = 10, search?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.promoCodes, page, size, search],
    queryFn: () => subscriptionApi.getPromoCodes(page, size, search),
  });
}

export function useValidPromoCodes() {
  return useQuery({
    queryKey: QUERY_KEYS.validPromoCodes,
    queryFn: subscriptionApi.getValidPromoCodes,
  });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePromoCodeRequest) => subscriptionApi.createPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promoCodes });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PromoCodeDTO> }) => 
      subscriptionApi.updatePromoCode(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promoCodes });
    },
  });
}

export function useDeactivatePromoCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscriptionApi.deactivatePromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promoCodes });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

// ========== Stats Hook ==========

export function useSubscriptionStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: subscriptionApi.getStats,
  });
}

// ========== Payments Hooks ==========

export function usePayments(page = 0, size = 10, status?: string, search?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.payments, page, size, status, search],
    queryFn: () => subscriptionApi.getPayments(page, size, status, search),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscriptionApi.refundPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments });
    },
  });
}
