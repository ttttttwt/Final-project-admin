/**
 * AI Management Types
 * Type definitions for AI quota management, cost analytics, and feature configuration
 */

// ===================================================================
// AI FEATURE TYPES
// ===================================================================

/**
 * AI feature types (matching backend enum)
 */
export type AIFeatureName =
  | "ROLE_PLAY"
  | "GRAMMAR"
  | "FLASHCARD"
  | "MAGIC_FLASHCARD"
  | "ROLEPLAY"
  | "GRAMMAR_SANDBOX"
  | "PRONUNCIATION_FEEDBACK"
  | "CONTENT_GENERATION";

/**
 * Display info for AI features
 */
export interface AIFeatureInfo {
  name: AIFeatureName;
  label: string;
  description: string;
  defaultDailyLimit: number;
  icon: string;
}

// ===================================================================
// USER QUOTA TYPES
// ===================================================================

/**
 * User AI quota entity
 */
export interface UserAIQuota {
  userId: string;
  userEmail: string;
  userFullName: string;
  rolePlayDailyLimit: number;
  rolePlayUsedToday: number;
  grammarDailyLimit: number;
  grammarUsedToday: number;
  flashcardDailyLimit: number;
  flashcardUsedToday: number;
  totalDailyLimit: number;
  totalUsedToday: number;
  isUnlimited: boolean;
  lastResetAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User quota search parameters
 */
export interface QuotaSearchParams {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  hasExceededLimit?: boolean;
}

/**
 * Paginated quota response
 */
export interface QuotaListResponse {
  content: UserAIQuota[];
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
 * Update quota input
 */
export interface UpdateQuotaInput {
  rolePlayDailyLimit?: number;
  grammarDailyLimit?: number;
  flashcardDailyLimit?: number;
  isUnlimited?: boolean;
}

/**
 * Bulk update quota input
 */
export interface BulkUpdateQuotaInput {
  userIds: string[];
  updates: UpdateQuotaInput;
}

// ===================================================================
// COST ANALYTICS TYPES
// ===================================================================

/**
 * Cost breakdown by feature
 */
export interface FeatureCostBreakdown {
  featureName: AIFeatureName;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  averageCostPerRequest: number;
  percentage: number;
}

/**
 * Daily cost data point
 */
export interface DailyCostData {
  date: string;
  totalCost: number;
  totalRequests: number;
  rolePlayCost: number;
  grammarCost: number;
  flashcardCost: number;
}

/**
 * Cost analytics summary
 */
export interface CostAnalyticsSummary {
  period: string;
  totalCost: number;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageCostPerRequest: number;
  averageCostPerUser: number;
  activeUsers: number;
  costByFeature: FeatureCostBreakdown[];
  dailyCosts: DailyCostData[];
  projectedMonthlyCost: number;
  budgetLimit: number;
  budgetUsedPercentage: number;
}

/**
 * Cost analytics query params
 */
export interface CostAnalyticsParams {
  period?: "today" | "week" | "month" | "quarter" | "year" | "all";
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

// ===================================================================
// AI CONFIGURATION TYPES
// ===================================================================

/**
 * Global AI feature configuration
 */
export interface AIFeatureConfig {
  featureName: AIFeatureName;
  isEnabled: boolean;
  defaultDailyLimit: number;
  premiumMultiplier: number;
  modelId: string;
  maxTokensPerRequest: number;
  temperatureDefault: number;
  systemPromptTemplate?: string;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Update AI feature config input
 */
export interface UpdateAIFeatureConfigInput {
  isEnabled?: boolean;
  defaultDailyLimit?: number;
  premiumMultiplier?: number;
  maxTokensPerRequest?: number;
  temperatureDefault?: number;
}

/**
 * AI global settings
 */
export interface AIGlobalSettings {
  globalEnabled: boolean;
  monthlyBudgetLimit: number;
  alertThresholdPercentage: number;
  fallbackEnabled: boolean;
  rateLimitEnabled: boolean;
  costPerInputToken: number;
  costPerOutputToken: number;
  features: AIFeatureConfig[];
}

// ===================================================================
// ALERT TYPES
// ===================================================================

/**
 * AI usage alert
 */
export interface AIUsageAlert {
  id: string;
  type: "BUDGET_WARNING" | "BUDGET_EXCEEDED" | "QUOTA_EXCEEDED" | "ERROR_SPIKE" | "API_ERROR";
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
  details?: Record<string, unknown>;
  createdAt: string;
  isRead: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

/**
 * Alert list response
 */
export interface AlertListResponse {
  content: AIUsageAlert[];
  totalElements: number;
  unreadCount: number;
}

// ===================================================================
// STATISTICS TYPES
// ===================================================================

/**
 * Top user by AI usage
 */
export interface TopAIUser {
  userId: string;
  userEmail: string;
  userFullName: string;
  totalRequests: number;
  totalCost: number;
  lastUsedAt: string;
}

/**
 * AI usage overview for dashboard
 */
export interface AIUsageOverview {
  totalRequestsToday: number;
  totalCostToday: number;
  activeUsersToday: number;
  topUsers: TopAIUser[];
  recentAlerts: AIUsageAlert[];
  featureUsageChart: {
    labels: string[];
    data: number[];
  };
}
