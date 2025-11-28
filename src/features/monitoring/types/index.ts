/**
 * Monitoring Types
 * Type definitions for system health and AI usage monitoring
 */

// ===================================================================
// HEALTH MONITORING TYPES
// ===================================================================

/**
 * Overall health status
 */
export type HealthStatus = "UP" | "DOWN" | "OUT_OF_SERVICE" | "UNKNOWN";

/**
 * Health component details
 */
export interface HealthComponent {
  status: HealthStatus;
  details?: Record<string, unknown>;
}

/**
 * Database health details
 */
export interface DatabaseHealth extends HealthComponent {
  details?: {
    database?: string;
    validationQuery?: string;
  };
}

/**
 * Disk space health details
 */
export interface DiskSpaceHealth extends HealthComponent {
  details?: {
    total?: number;
    free?: number;
    threshold?: number;
    path?: string;
    exists?: boolean;
  };
}

/**
 * Health response from actuator
 */
export interface HealthResponse {
  status: HealthStatus;
  components?: {
    db?: DatabaseHealth;
    diskSpace?: DiskSpaceHealth;
    ping?: HealthComponent;
    [key: string]: HealthComponent | undefined;
  };
}

/**
 * Metric measurement
 */
export interface MetricMeasurement {
  statistic: string;
  value: number;
}

/**
 * Metric tag
 */
export interface MetricTag {
  tag: string;
  values: string[];
}

/**
 * Metric response from actuator
 */
export interface MetricResponse {
  name: string;
  description?: string;
  baseUnit?: string;
  measurements: MetricMeasurement[];
  availableTags?: MetricTag[];
}

/**
 * System metrics summary
 */
export interface SystemMetrics {
  jvmMemoryUsed: number;
  jvmMemoryMax: number;
  jvmMemoryCommitted: number;
  systemCpuUsage: number;
  processCpuUsage: number;
  httpRequestsTotal: number;
  httpServerRequestsActive: number;
  jvmThreadsLive: number;
  jvmThreadsPeak: number;
  jvmUptimeSeconds: number;
}

/**
 * Health card display data
 */
export interface HealthCard {
  name: string;
  status: HealthStatus;
  icon: string;
  details?: Record<string, unknown>;
}

// ===================================================================
// AI USAGE LOGS TYPES
// ===================================================================

/**
 * AI feature types
 */
export type AIFeature =
  | "MAGIC_FLASHCARD"
  | "ROLEPLAY"
  | "GRAMMAR_SANDBOX"
  | "PRONUNCIATION_FEEDBACK"
  | "CONTENT_GENERATION";

/**
 * AI usage log entry
 */
export interface AIUsageLog {
  id: number;
  userId: string;
  userEmail?: string;
  featureName: AIFeature;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  createdAt: string;
}

/**
 * AI usage logs search parameters
 */
export interface AIUsageLogsSearchParams {
  page?: number;
  size?: number;
  featureName?: AIFeature;
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

/**
 * Paginated AI usage logs response
 */
export interface AIUsageLogsResponse {
  content: AIUsageLog[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * AI usage summary stats
 */
export interface AIUsageSummary {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  averageCostPerCall: number;
  callsByFeature: Record<AIFeature, number>;
}

/**
 * AI usage stats period
 */
export type AIUsageStatsPeriod = "today" | "week" | "month" | "all";

/**
 * AI usage stats response
 */
export interface AIUsageStats {
  period: AIUsageStatsPeriod;
  stats: AIUsageSummary;
}
