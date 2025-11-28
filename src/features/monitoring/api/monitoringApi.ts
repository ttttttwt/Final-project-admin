/**
 * Monitoring API
 * API services for system health and AI usage monitoring
 */

import api from "@/lib/api";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import type {
  HealthResponse,
  MetricResponse,
  AIUsageLogsResponse,
  AIUsageLogsSearchParams,
  AIUsageStats,
  AIUsageStatsPeriod,
} from "../types";

// Actuator base URL (different from main API)
const ACTUATOR_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:8088";

/**
 * Create axios instance for actuator endpoints
 */
const actuatorApi = axios.create({
  baseURL: ACTUATOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor for actuator
actuatorApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Health Monitoring API
 */
export const healthApi = {
  /**
   * Get overall system health status
   */
  getHealth: async (): Promise<HealthResponse> => {
    const response = await actuatorApi.get<HealthResponse>("/actuator/health");
    return response.data;
  },

  /**
   * Get specific metric by name
   * @param metricName - Name of the metric (e.g., 'jvm.memory.used')
   */
  getMetric: async (metricName: string): Promise<MetricResponse> => {
    const response = await actuatorApi.get<MetricResponse>(
      `/actuator/metrics/${metricName}`
    );
    return response.data;
  },

  /**
   * Get list of available metrics
   */
  getMetricNames: async (): Promise<{ names: string[] }> => {
    const response = await actuatorApi.get<{ names: string[] }>(
      "/actuator/metrics"
    );
    return response.data;
  },

  /**
   * Get application info
   */
  getInfo: async (): Promise<Record<string, unknown>> => {
    const response = await actuatorApi.get<Record<string, unknown>>(
      "/actuator/info"
    );
    return response.data;
  },
};

/**
 * AI Usage Logs API
 */
export const aiUsageApi = {
  /**
   * Get paginated AI usage logs
   */
  getLogs: async (
    params: AIUsageLogsSearchParams
  ): Promise<AIUsageLogsResponse> => {
    const response = await api.get<AIUsageLogsResponse>("/admin/ai-usage", {
      params,
    });
    return response.data;
  },

  /**
   * Get AI usage summary statistics
   */
  getStats: async (
    period: AIUsageStatsPeriod = "today"
  ): Promise<AIUsageStats> => {
    const response = await api.get<AIUsageStats>("/admin/ai-usage/stats", {
      params: { period },
    });
    return response.data;
  },

  /**
   * Export AI usage logs to CSV
   */
  exportCsv: async (params: AIUsageLogsSearchParams): Promise<Blob> => {
    const response = await api.get("/admin/ai-usage/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};

export default { healthApi, aiUsageApi };
