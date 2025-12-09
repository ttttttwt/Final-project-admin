/**
 * Email Management API
 * API service for admin email operations
 */

import api from "@/lib/api";
import type { Page } from "@/types/api.types";
import type {
  AdminEmailRequest,
  EmailQueueDTO,
  EmailQueueSearchParams,
  EmailStatsDTO,
  SendEmailResponse,
  StatsPeriod,
} from "../types/email.types";

const BASE_URL = "/admin/emails";

/**
 * Email Management API functions
 */
export const emailsApi = {
  /**
   * Send email to specific users
   */
  sendEmail: async (request: AdminEmailRequest): Promise<SendEmailResponse> => {
    const response = await api.post<SendEmailResponse>(
      `${BASE_URL}/send`,
      request
    );
    return response.data;
  },

  /**
   * Broadcast email to all active users
   */
  broadcastEmail: async (
    request: AdminEmailRequest
  ): Promise<SendEmailResponse> => {
    const response = await api.post<SendEmailResponse>(
      `${BASE_URL}/broadcast`,
      request
    );
    return response.data;
  },

  /**
   * Get email queue with pagination and optional status filter
   */
  getEmailQueue: async (
    params: EmailQueueSearchParams = {}
  ): Promise<Page<EmailQueueDTO>> => {
    const response = await api.get<Page<EmailQueueDTO>>(`${BASE_URL}/queue`, {
      params: {
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "createdAt,desc",
      },
    });
    return response.data;
  },

  /**
   * Get email statistics
   */
  getEmailStats: async (
    period: StatsPeriod = "LAST_7_DAYS"
  ): Promise<EmailStatsDTO> => {
    const response = await api.get<EmailStatsDTO>(`${BASE_URL}/stats`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get details of a specific email
   */
  getEmailDetails: async (emailId: string): Promise<EmailQueueDTO> => {
    const response = await api.get<EmailQueueDTO>(`${BASE_URL}/${emailId}`);
    return response.data;
  },

  /**
   * Retry a failed email
   */
  retryEmail: async (
    emailId: string
  ): Promise<{ message: string; emailId: string }> => {
    const response = await api.post<{ message: string; emailId: string }>(
      `${BASE_URL}/${emailId}/retry`
    );
    return response.data;
  },

  /**
   * Cancel a pending email
   */
  cancelEmail: async (
    emailId: string
  ): Promise<{ message: string; emailId: string }> => {
    const response = await api.post<{ message: string; emailId: string }>(
      `${BASE_URL}/${emailId}/cancel`
    );
    return response.data;
  },
};
