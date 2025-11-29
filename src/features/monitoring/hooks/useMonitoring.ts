/**
 * Monitoring Hooks
 * TanStack Query hooks for system health and AI usage monitoring
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  healthApi,
  aiUsageApi,
  activityLogsApi,
  auditLogsApi,
} from "../api/monitoringApi";
import type {
  AIUsageLogsSearchParams,
  AIUsageStatsPeriod,
  SystemMetrics,
  AdminActivityLogsSearchParams,
  AuditLogsSearchParams,
} from "../types";
import { toast } from "@/hooks/use-toast";

// Query keys
const MONITORING_KEYS = {
  health: ["monitoring", "health"] as const,
  metrics: ["monitoring", "metrics"] as const,
  metric: (name: string) => ["monitoring", "metrics", name] as const,
  info: ["monitoring", "info"] as const,
  aiUsageLogs: (params: AIUsageLogsSearchParams) =>
    ["monitoring", "ai-usage", params] as const,
  aiUsageStats: (period: AIUsageStatsPeriod) =>
    ["monitoring", "ai-usage", "stats", period] as const,
  activityLogs: (params: AdminActivityLogsSearchParams) =>
    ["monitoring", "activity-logs", params] as const,
  activityStats: (period: string) =>
    ["monitoring", "activity-logs", "stats", period] as const,
  activityActions: ["monitoring", "activity-logs", "actions"] as const,
  activityUsers: ["monitoring", "activity-logs", "users"] as const,
  auditLogs: (params: AuditLogsSearchParams) =>
    ["monitoring", "audit-logs", params] as const,
  auditActions: ["monitoring", "audit-logs", "actions"] as const,
  auditEntityTypes: ["monitoring", "audit-logs", "entity-types"] as const,
};

/**
 * Hook to fetch system health status
 */
export const useHealth = (options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: MONITORING_KEYS.health,
    queryFn: () => healthApi.getHealth(),
    refetchInterval: options?.refetchInterval,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch a specific metric
 */
export const useMetric = (
  metricName: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: MONITORING_KEYS.metric(metricName),
    queryFn: () => healthApi.getMetric(metricName),
    enabled: options?.enabled ?? true,
    staleTime: 10 * 1000, // 10 seconds
  });
};

/**
 * Hook to fetch multiple system metrics at once
 */
export const useSystemMetrics = (options?: { refetchInterval?: number }) => {
  const metricsToFetch = [
    "jvm.memory.used",
    "jvm.memory.max",
    "jvm.memory.committed",
    "system.cpu.usage",
    "process.cpu.usage",
    "http.server.requests",
    "jvm.threads.live",
    "jvm.threads.peak",
    "process.uptime",
  ];

  return useQuery({
    queryKey: MONITORING_KEYS.metrics,
    queryFn: async (): Promise<SystemMetrics> => {
      const results = await Promise.allSettled(
        metricsToFetch.map((name) => healthApi.getMetric(name))
      );

      const metrics: SystemMetrics = {
        jvmMemoryUsed: 0,
        jvmMemoryMax: 0,
        jvmMemoryCommitted: 0,
        systemCpuUsage: 0,
        processCpuUsage: 0,
        httpRequestsTotal: 0,
        httpServerRequestsActive: 0,
        jvmThreadsLive: 0,
        jvmThreadsPeak: 0,
        jvmUptimeSeconds: 0,
      };

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const value = result.value.measurements[0]?.value ?? 0;
          const metricName = metricsToFetch[index];

          switch (metricName) {
            case "jvm.memory.used":
              metrics.jvmMemoryUsed = value;
              break;
            case "jvm.memory.max":
              metrics.jvmMemoryMax = value;
              break;
            case "jvm.memory.committed":
              metrics.jvmMemoryCommitted = value;
              break;
            case "system.cpu.usage":
              metrics.systemCpuUsage = value;
              break;
            case "process.cpu.usage":
              metrics.processCpuUsage = value;
              break;
            case "http.server.requests":
              metrics.httpRequestsTotal = value;
              break;
            case "jvm.threads.live":
              metrics.jvmThreadsLive = value;
              break;
            case "jvm.threads.peak":
              metrics.jvmThreadsPeak = value;
              break;
            case "process.uptime":
              metrics.jvmUptimeSeconds = value;
              break;
          }
        }
      });

      return metrics;
    },
    refetchInterval: options?.refetchInterval,
    staleTime: 10 * 1000, // 10 seconds
  });
};

/**
 * Hook to fetch application info
 */
export const useAppInfo = () => {
  return useQuery({
    queryKey: MONITORING_KEYS.info,
    queryFn: () => healthApi.getInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch AI usage logs
 */
export const useAIUsageLogs = (params: AIUsageLogsSearchParams) => {
  return useQuery({
    queryKey: MONITORING_KEYS.aiUsageLogs(params),
    queryFn: () => aiUsageApi.getLogs(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch AI usage statistics
 */
export const useAIUsageStats = (period: AIUsageStatsPeriod = "today") => {
  return useQuery({
    queryKey: MONITORING_KEYS.aiUsageStats(period),
    queryFn: () => aiUsageApi.getStats(period),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to export AI usage logs to CSV
 */
export const useExportAIUsageLogs = () => {
  return useMutation({
    mutationFn: (params: AIUsageLogsSearchParams) =>
      aiUsageApi.exportCsv(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-usage-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "AI usage logs have been exported to CSV.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export AI usage logs.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to invalidate all monitoring queries
 */
export const useInvalidateMonitoring = () => {
  const queryClient = useQueryClient();

  return {
    invalidateHealth: () =>
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.health }),
    invalidateMetrics: () =>
      queryClient.invalidateQueries({ queryKey: MONITORING_KEYS.metrics }),
    invalidateAIUsage: () =>
      queryClient.invalidateQueries({ queryKey: ["monitoring", "ai-usage"] }),
    invalidateActivityLogs: () =>
      queryClient.invalidateQueries({
        queryKey: ["monitoring", "activity-logs"],
      }),
    invalidateAuditLogs: () =>
      queryClient.invalidateQueries({ queryKey: ["monitoring", "audit-logs"] }),
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: ["monitoring"] }),
  };
};

// ===================================================================
// ADMIN ACTIVITY LOGS HOOKS
// ===================================================================

/**
 * Hook to fetch admin activity logs
 */
export const useActivityLogs = (params: AdminActivityLogsSearchParams) => {
  return useQuery({
    queryKey: MONITORING_KEYS.activityLogs(params),
    queryFn: () => activityLogsApi.getLogs(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch admin activity statistics
 */
export const useActivityStats = (period: string = "today") => {
  return useQuery({
    queryKey: MONITORING_KEYS.activityStats(period),
    queryFn: () => activityLogsApi.getStats(period),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch distinct action types for filtering
 */
export const useActivityActions = () => {
  return useQuery({
    queryKey: MONITORING_KEYS.activityActions,
    queryFn: () => activityLogsApi.getDistinctActions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch distinct user names for filtering
 */
export const useActivityUsers = () => {
  return useQuery({
    queryKey: MONITORING_KEYS.activityUsers,
    queryFn: () => activityLogsApi.getDistinctUserNames(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to export activity logs to CSV
 */
export const useExportActivityLogs = () => {
  return useMutation({
    mutationFn: (params: AdminActivityLogsSearchParams) =>
      activityLogsApi.exportCsv(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Activity logs have been exported to CSV.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export activity logs.",
        variant: "destructive",
      });
    },
  });
};

// ===================================================================
// AUDIT LOGS HOOKS
// ===================================================================

/**
 * Hook to fetch audit logs
 */
export const useAuditLogs = (params: AuditLogsSearchParams) => {
  return useQuery({
    queryKey: MONITORING_KEYS.auditLogs(params),
    queryFn: () => auditLogsApi.getLogs(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch distinct action types for filtering
 */
export const useAuditActions = () => {
  return useQuery({
    queryKey: MONITORING_KEYS.auditActions,
    queryFn: () => auditLogsApi.getDistinctActions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch distinct entity types for filtering
 */
export const useAuditEntityTypes = () => {
  return useQuery({
    queryKey: MONITORING_KEYS.auditEntityTypes,
    queryFn: () => auditLogsApi.getDistinctEntityTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to export audit logs to CSV
 */
export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (params: AuditLogsSearchParams) =>
      auditLogsApi.exportCsv(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Audit logs have been exported to CSV.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export audit logs.",
        variant: "destructive",
      });
    },
  });
};
