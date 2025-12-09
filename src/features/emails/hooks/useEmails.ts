/**
 * Email Management Hooks
 * React Query hooks for email operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { emailsApi } from "../api/emailsApi";
import type {
  AdminEmailRequest,
  EmailQueueSearchParams,
  StatsPeriod,
} from "../types/email.types";

// Query Keys
export const emailQueryKeys = {
  all: ["emails"] as const,
  queue: (params: EmailQueueSearchParams) =>
    [...emailQueryKeys.all, "queue", params] as const,
  stats: (period: StatsPeriod) =>
    [...emailQueryKeys.all, "stats", period] as const,
  detail: (id: string) => [...emailQueryKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch email queue
 */
export function useEmailQueue(params: EmailQueueSearchParams = {}) {
  return useQuery({
    queryKey: emailQueryKeys.queue(params),
    queryFn: () => emailsApi.getEmailQueue(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch email statistics
 */
export function useEmailStats(period: StatsPeriod = "LAST_7_DAYS") {
  return useQuery({
    queryKey: emailQueryKeys.stats(period),
    queryFn: () => emailsApi.getEmailStats(period),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch single email details
 */
export function useEmailDetails(emailId: string | null) {
  return useQuery({
    queryKey: emailQueryKeys.detail(emailId ?? ""),
    queryFn: () => emailsApi.getEmailDetails(emailId!),
    enabled: !!emailId,
  });
}

/**
 * Hook to send email to specific users
 */
export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AdminEmailRequest) => emailsApi.sendEmail(request),
    onSuccess: () => {
      // Invalidate queue to show new emails
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.all });
    },
  });
}

/**
 * Hook to broadcast email to all users
 */
export function useBroadcastEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AdminEmailRequest) =>
      emailsApi.broadcastEmail(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.all });
    },
  });
}

/**
 * Hook to retry failed email
 */
export function useRetryEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) => emailsApi.retryEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.all });
    },
  });
}

/**
 * Hook to cancel pending email
 */
export function useCancelEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) => emailsApi.cancelEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.all });
    },
  });
}
