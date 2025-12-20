/**
 * AI Management API
 * API services for user quotas, cost analytics, and AI configuration
 */

import api from "@/lib/api";
import type {
  UserAIQuota,
  QuotaSearchParams,
  QuotaListResponse,
  UpdateQuotaInput,
  BulkUpdateQuotaInput,
  CostAnalyticsSummary,
  CostAnalyticsParams,
  AIGlobalSettings,
  AIFeatureConfig,
  UpdateAIFeatureConfigInput,
  AlertListResponse,
  AIUsageOverview,
} from "../types";

// ===================================================================
// QUOTA MANAGEMENT API
// ===================================================================

/**
 * User AI Quota API
 */
export const quotaApi = {
  /**
   * Get paginated list of user AI quotas
   */
  getQuotas: async (params: QuotaSearchParams): Promise<QuotaListResponse> => {
    const response = await api.get<QuotaListResponse>("/admin/ai-quotas", {
      params,
    });
    return response.data;
  },

  /**
   * Get quota for a specific user
   */
  getQuotaByUserId: async (userId: string): Promise<UserAIQuota> => {
    const response = await api.get<UserAIQuota>(`/admin/ai-quotas/${userId}`);
    return response.data;
  },

  /**
   * Update user's AI quota limits
   */
  updateQuota: async (
    userId: string,
    data: UpdateQuotaInput
  ): Promise<UserAIQuota> => {
    const response = await api.put<UserAIQuota>(
      `/admin/ai-quotas/${userId}`,
      data
    );
    return response.data;
  },

  /**
   * Reset user's daily quota counters
   */
  resetQuota: async (userId: string): Promise<UserAIQuota> => {
    const response = await api.post<UserAIQuota>(
      `/admin/ai-quotas/${userId}/reset`
    );
    return response.data;
  },

  /**
   * Bulk update quotas for multiple users
   */
  bulkUpdateQuotas: async (
    data: BulkUpdateQuotaInput
  ): Promise<{ updated: number; failed: number }> => {
    const response = await api.post<{ updated: number; failed: number }>(
      "/admin/ai-quotas/bulk",
      data
    );
    return response.data;
  },

  /**
   * Set unlimited quota for a user
   */
  setUnlimited: async (
    userId: string,
    isUnlimited: boolean
  ): Promise<UserAIQuota> => {
    const response = await api.patch<UserAIQuota>(
      `/admin/ai-quotas/${userId}/unlimited`,
      { isUnlimited }
    );
    return response.data;
  },
};

// ===================================================================
// COST ANALYTICS API
// ===================================================================

/**
 * Cost Analytics API
 */
export const costApi = {
  /**
   * Get cost analytics summary
   */
  getAnalytics: async (
    params: CostAnalyticsParams
  ): Promise<CostAnalyticsSummary> => {
    const response = await api.get<CostAnalyticsSummary>(
      "/admin/ai-costs/analytics",
      { params }
    );
    return response.data;
  },

  /**
   * Get projected costs
   */
  getProjection: async (): Promise<{
    currentMonthCost: number;
    projectedMonthCost: number;
    daysRemaining: number;
    averageDailyCost: number;
  }> => {
    const response = await api.get("/admin/ai-costs/projection");
    return response.data;
  },

  /**
   * Export cost report to CSV
   */
  exportReport: async (params: CostAnalyticsParams): Promise<Blob> => {
    const response = await api.get("/admin/ai-costs/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Get cost breakdown by user
   */
  getCostsByUser: async (params: {
    period?: string;
    limit?: number;
  }): Promise<
    Array<{
      userId: string;
      userEmail: string;
      totalCost: number;
      totalRequests: number;
    }>
  > => {
    const response = await api.get("/admin/ai-costs/by-user", { params });
    return response.data;
  },

  /**
   * Set monthly budget
   */
  updateBudget: async (budget: number): Promise<{ budget: number }> => {
    const response = await api.put<{ budget: number }>("/admin/ai-costs/budget", {
      budget,
    });
    return response.data;
  },
};

// ===================================================================
// AI CONFIGURATION API
// ===================================================================

/**
 * AI Configuration API
 */
export const configApi = {
  /**
   * Get global AI settings
   */
  getSettings: async (): Promise<AIGlobalSettings> => {
    const response = await api.get<AIGlobalSettings>("/admin/ai-config");
    return response.data;
  },

  /**
   * Update global AI settings
   */
  updateSettings: async (
    data: Partial<Omit<AIGlobalSettings, "features">>
  ): Promise<AIGlobalSettings> => {
    const response = await api.put<AIGlobalSettings>("/admin/ai-config", data);
    return response.data;
  },

  /**
   * Get feature-specific configuration
   */
  getFeatureConfig: async (featureId: string): Promise<AIFeatureConfig> => {
    const response = await api.get<AIFeatureConfig>(
      `/admin/ai-config/features/${featureId}`
    );
    return response.data;
  },

  /**
   * Update feature-specific configuration
   */
  updateFeatureConfig: async (
    featureId: string,
    data: UpdateAIFeatureConfigInput
  ): Promise<AIFeatureConfig> => {
    const response = await api.put<AIFeatureConfig>(
      `/admin/ai-config/features/${featureId}`,
      data
    );
    return response.data;
  },

  /**
   * Toggle feature enabled status
   */
  toggleFeature: async (
    featureId: string,
    enabled: boolean
  ): Promise<AIFeatureConfig> => {
    const response = await api.patch<AIFeatureConfig>(
      `/admin/ai-config/features/${featureId}/toggle`,
      { enabled }
    );
    return response.data;
  },

  /**
   * Get plan-specific quota limits
   */
  getPlanLimits: async (): Promise<import("../types").PlanLimits> => {
    const response = await api.get<import("../types").PlanLimits>(
      "/admin/ai-config/plan-limits"
    );
    return response.data;
  },

  /**
   * Update plan-specific quota limits
   */
  updatePlanLimits: async (
    data: import("../types").PlanLimits
  ): Promise<import("../types").PlanLimits> => {
    const response = await api.put<import("../types").PlanLimits>(
      "/admin/ai-config/plan-limits",
      data
    );
    return response.data;
  },
};

// ===================================================================
// ALERTS API
// ===================================================================

/**
 * AI Alerts API
 */
export const alertsApi = {
  /**
   * Get AI usage alerts
   */
  getAlerts: async (params?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<AlertListResponse> => {
    const response = await api.get<AlertListResponse>("/admin/ai-alerts", {
      params,
    });
    return response.data;
  },

  /**
   * Mark alert as read
   */
  markAsRead: async (alertId: string): Promise<void> => {
    await api.patch(`/admin/ai-alerts/${alertId}/read`);
  },

  /**
   * Acknowledge alert
   */
  acknowledgeAlert: async (alertId: string): Promise<void> => {
    await api.post(`/admin/ai-alerts/${alertId}/acknowledge`);
  },

  /**
   * Mark all alerts as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.post("/admin/ai-alerts/read-all");
  },
};

// ===================================================================
// OVERVIEW API
// ===================================================================

/**
 * AI Overview API (for dashboard)
 */
export const overviewApi = {
  /**
   * Get AI usage overview for dashboard
   */
  getOverview: async (): Promise<AIUsageOverview> => {
    const response = await api.get<AIUsageOverview>("/admin/ai-overview");
    return response.data;
  },
};
