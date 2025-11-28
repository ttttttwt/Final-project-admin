/**
 * Monitoring Hooks
 * TanStack Query hooks for system health and AI usage monitoring
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healthApi, aiUsageApi } from "../api/monitoringApi";
import type {
  AIUsageLogsSearchParams,
  AIUsageStatsPeriod,
  SystemMetrics,
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
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: ["monitoring"] }),
  };
};
