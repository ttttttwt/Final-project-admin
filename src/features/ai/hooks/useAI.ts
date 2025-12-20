/**
 * AI Management Hooks
 * TanStack Query hooks for quotas, costs, configuration, and alerts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotaApi, costApi, configApi, alertsApi, overviewApi } from "../api/aiApi";
import type {
  QuotaSearchParams,
  UpdateQuotaInput,
  BulkUpdateQuotaInput,
  CostAnalyticsParams,
  UpdateAIFeatureConfigInput,
} from "../types";
import { toast } from "@/hooks/use-toast";

// ===================================================================
// QUERY KEYS
// ===================================================================

export const AI_KEYS = {
  // Quotas
  quotas: (params: QuotaSearchParams) => ["ai", "quotas", params] as const,
  quota: (userId: string) => ["ai", "quotas", userId] as const,
  
  // Costs
  costAnalytics: (params: CostAnalyticsParams) => ["ai", "costs", "analytics", params] as const,
  costProjection: ["ai", "costs", "projection"] as const,
  costsByUser: (params: { period?: string; limit?: number }) =>
    ["ai", "costs", "by-user", params] as const,
  
  // Config
  settings: ["ai", "config", "settings"] as const,
  featureConfig: (featureId: string) =>
    ["ai", "config", "features", featureId] as const,
  
  // Alerts
  alerts: (params?: { unreadOnly?: boolean; limit?: number }) =>
    ["ai", "alerts", params] as const,
  
  // Overview
  overview: ["ai", "overview"] as const,
};

// ===================================================================
// QUOTA HOOKS
// ===================================================================

/**
 * Hook to fetch paginated user AI quotas
 */
export const useQuotas = (params: QuotaSearchParams) => {
  return useQuery({
    queryKey: AI_KEYS.quotas(params),
    queryFn: () => quotaApi.getQuotas(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch a single user's quota
 */
export const useQuota = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: AI_KEYS.quota(userId),
    queryFn: () => quotaApi.getQuotaByUserId(userId),
    enabled: options?.enabled ?? !!userId,
    staleTime: 30 * 1000,
  });
};

/**
 * Hook to update a user's quota
 */
export const useUpdateQuota = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateQuotaInput }) =>
      quotaApi.updateQuota(userId, data),
    onSuccess: (updatedQuota, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["ai", "quotas"] });
      queryClient.setQueryData(AI_KEYS.quota(userId), updatedQuota);
      toast({
        title: "Quota updated",
        description: "User quota has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update quota",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to reset a user's daily quota counters
 */
export const useResetQuota = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => quotaApi.resetQuota(userId),
    onSuccess: (updatedQuota, userId) => {
      queryClient.invalidateQueries({ queryKey: ["ai", "quotas"] });
      queryClient.setQueryData(AI_KEYS.quota(userId), updatedQuota);
      toast({
        title: "Quota reset",
        description: "User's daily usage counters have been reset.",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Failed to reset quota",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to bulk update quotas
 */
export const useBulkUpdateQuotas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkUpdateQuotaInput) => quotaApi.bulkUpdateQuotas(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["ai", "quotas"] });
      toast({
        title: "Bulk update complete",
        description: `Updated ${result.updated} quotas. ${result.failed > 0 ? `${result.failed} failed.` : ""}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Bulk update failed",
        description: error instanceof Error ? error.message : "Failed to update quotas",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to toggle unlimited quota
 */
export const useSetUnlimited = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, isUnlimited }: { userId: string; isUnlimited: boolean }) =>
      quotaApi.setUnlimited(userId, isUnlimited),
    onSuccess: (updatedQuota, { userId, isUnlimited }) => {
      queryClient.invalidateQueries({ queryKey: ["ai", "quotas"] });
      queryClient.setQueryData(AI_KEYS.quota(userId), updatedQuota);
      toast({
        title: isUnlimited ? "Unlimited quota enabled" : "Quota limits restored",
        description: isUnlimited
          ? "User now has unlimited AI usage."
          : "User is now subject to daily limits.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update quota",
        variant: "destructive",
      });
    },
  });
};

// ===================================================================
// COST ANALYTICS HOOKS
// ===================================================================

/**
 * Hook to fetch cost analytics
 */
export const useCostAnalytics = (params: CostAnalyticsParams) => {
  return useQuery({
    queryKey: AI_KEYS.costAnalytics(params),
    queryFn: () => costApi.getAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch cost projection
 */
export const useCostProjection = () => {
  return useQuery({
    queryKey: AI_KEYS.costProjection,
    queryFn: () => costApi.getProjection(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch costs grouped by user
 */
export const useCostsByUser = (params: { period?: string; limit?: number }) => {
  return useQuery({
    queryKey: AI_KEYS.costsByUser(params),
    queryFn: () => costApi.getCostsByUser(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to export cost report
 */
export const useExportCostReport = () => {
  return useMutation({
    mutationFn: (params: CostAnalyticsParams) => costApi.exportReport(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-cost-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export complete",
        description: "Cost report has been downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update monthly budget
 */
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budget: number) => costApi.updateBudget(budget),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ai", "costs"] });
      toast({
        title: "Budget updated",
        description: `Monthly budget set to $${data.budget}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update budget",
        variant: "destructive",
      });
    },
  });
};

// ===================================================================
// CONFIGURATION HOOKS
// ===================================================================

/**
 * Hook to fetch global AI settings
 */
export const useAISettings = () => {
  return useQuery({
    queryKey: AI_KEYS.settings,
    queryFn: () => configApi.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to update global AI settings
 */
export const useUpdateAISettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: configApi.updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(AI_KEYS.settings, updatedSettings);
      toast({
        title: "Settings updated",
        description: "AI settings have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to fetch feature-specific config
 */
export const useFeatureConfig = (featureId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: AI_KEYS.featureConfig(featureId),
    queryFn: () => configApi.getFeatureConfig(featureId),
    enabled: options?.enabled ?? !!featureId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to update feature config
 */
export const useUpdateFeatureConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      featureId,
      data,
    }: {
      featureId: string;
      data: UpdateAIFeatureConfigInput;
    }) => configApi.updateFeatureConfig(featureId, data),
    onSuccess: (updatedConfig, { featureId }) => {
      queryClient.setQueryData(AI_KEYS.featureConfig(featureId), updatedConfig);
      queryClient.invalidateQueries({ queryKey: AI_KEYS.settings });
      toast({
        title: "Feature updated",
        description: `${featureId} configuration has been saved.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update feature",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to toggle feature on/off
 */
export const useToggleFeature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ featureId, enabled }: { featureId: string; enabled: boolean }) =>
      configApi.toggleFeature(featureId, enabled),
    onSuccess: (updatedConfig, { featureId, enabled }) => {
      queryClient.setQueryData(AI_KEYS.featureConfig(featureId), updatedConfig);
      queryClient.invalidateQueries({ queryKey: AI_KEYS.settings });
      toast({
        title: enabled ? "Feature enabled" : "Feature disabled",
        description: `${featureId} has been ${enabled ? "enabled" : "disabled"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Toggle failed",
        description: error instanceof Error ? error.message : "Failed to toggle feature",
        variant: "destructive",
      });
    },
  });
};

// ===================================================================
// PLAN LIMITS HOOKS
// ===================================================================

/**
 * Hook to fetch plan-specific quota limits
 */
export const usePlanLimits = () => {
  return useQuery({
    queryKey: ["ai", "plan-limits"],
    queryFn: () => configApi.getPlanLimits(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to update plan-specific quota limits
 */
export const useUpdatePlanLimits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: configApi.updatePlanLimits,
    onSuccess: (updatedLimits) => {
      queryClient.setQueryData(["ai", "plan-limits"], updatedLimits);
      toast({
        title: "Plan limits updated",
        description: "Free and Pro quota limits have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update plan limits",
        variant: "destructive",
      });
    },
  });
};

// ===================================================================
// ALERTS HOOKS
// ===================================================================

/**
 * Hook to fetch AI alerts
 */
export const useAIAlerts = (params?: { unreadOnly?: boolean; limit?: number }) => {
  return useQuery({
    queryKey: AI_KEYS.alerts(params),
    queryFn: () => alertsApi.getAlerts(params),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

/**
 * Hook to mark alert as read
 */
export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: string) => alertsApi.markAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "alerts"] });
    },
  });
};

/**
 * Hook to acknowledge an alert
 */
export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: string) => alertsApi.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "alerts"] });
      toast({
        title: "Alert acknowledged",
        description: "The alert has been acknowledged.",
      });
    },
  });
};

/**
 * Hook to mark all alerts as read
 */
export const useMarkAllAlertsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => alertsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "alerts"] });
      toast({
        title: "All alerts marked as read",
      });
    },
  });
};

// ===================================================================
// OVERVIEW HOOKS
// ===================================================================

/**
 * Hook to fetch AI overview for dashboard
 */
export const useAIOverview = () => {
  return useQuery({
    queryKey: AI_KEYS.overview,
    queryFn: () => overviewApi.getOverview(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};
