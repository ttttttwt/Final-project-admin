/**
 * AI Management Types
 * Type definitions for AI quota management, cost analytics, and feature configuration
 */

// ===================================================================
// PLAN TYPE
// ===================================================================

/**
 * Subscription plan types
 */
export type PlanType = "FREE" | "MONTHLY" | "YEARLY";

/**
 * Check if a plan type is Pro (MONTHLY or YEARLY)
 */
export const isPro = (planType: PlanType): boolean => {
  return planType === "MONTHLY" || planType === "YEARLY";
};

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
 * User AI quota entity with subscription-based limits
 */
export interface UserAIQuota {
  userId: string;
  userEmail: string;
  userFullName: string;
  
  // ========== Subscription-Based Quota (NEW) ==========
  
  /** User's subscription plan: FREE, MONTHLY, YEARLY */
  planType: PlanType;
  
  /** Date when monthly quota resets */
  quotaResetDate?: string;
  
  /** Days until next quota reset */
  daysUntilReset?: number;
  
  /** Role play sessions used/limit for current month */
  roleplaySessionsUsed: number;
  roleplaySessionsLimit: number;
  
  /** Flashcard decks generated used/limit for current month */
  flashcardDecksUsed: number;
  flashcardDecksLimit: number;
  
  /** Grammar exercises generated used/limit for current month */
  grammarExercisesUsed: number;
  grammarExercisesLimit: number;
  
  /** Custom materials created used/limit for current month */
  customMaterialsUsed: number;
  customMaterialsLimit: number;
  
  /** Total AI requests used/limit for current month */
  totalRequestsUsed: number;
  totalRequestsLimit: number;
  
  /** Warning flags */
  quotaWarning?: boolean;
  quotaCritical?: boolean;
  
  // ========== Legacy Fields (Backward Compatibility) ==========
  
  /** @deprecated Use roleplaySessionsLimit */
  rolePlayDailyLimit: number;
  /** @deprecated Use roleplaySessionsUsed */
  rolePlayUsedToday: number;
  /** @deprecated Use grammarExercisesLimit */
  grammarDailyLimit: number;
  /** @deprecated Use grammarExercisesUsed */
  grammarUsedToday: number;
  /** @deprecated Use flashcardDecksLimit */
  flashcardDailyLimit: number;
  /** @deprecated Use flashcardDecksUsed */
  flashcardUsedToday: number;
  /** @deprecated Use totalRequestsLimit */
  totalDailyLimit: number;
  /** @deprecated Use totalRequestsUsed */
  totalUsedToday: number;
  
  isPremium?: boolean;
  isUnlimited: boolean;
  suspended?: boolean;
  lastResetAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  planType?: "FREE" | "PRO" | "ALL";
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
 * Quota summary statistics
 */
export interface QuotaSummaryStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  quotaExceeded: number;
  unlimitedUsers: number;
}

/**
 * Update quota input
 */
export interface UpdateQuotaInput {
  rolePlayDailyLimit?: number;
  grammarDailyLimit?: number;
  flashcardDailyLimit?: number;
  customMaterialsLimit?: number;
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
  
  /** Cost breakdown by subscription plan (Free vs Pro) */
  costByPlan?: {
    freeCost: number;
    proCost: number;
    freeUsers: number;
    proUsers: number;
    freeRequests: number;
    proRequests: number;
  };
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
  featureId: string;
  name: string;
  enabled: boolean;
  modelId: string;
  maxTokens: number;
  temperature: number;
  dailyLimit: number;
}

/**
 * Update AI feature config input
 */
export interface UpdateAIFeatureConfigInput {
  enabled?: boolean;
  dailyLimit?: number;
  maxTokens?: number;
  temperature?: number;
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
  planType?: PlanType;
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

// ===================================================================
// PLAN LIMITS TYPES
// ===================================================================

/**
 * Plan-specific quota limits for Free and Pro tiers
 */
export interface PlanLimits {
  // Free tier limits
  freeRoleplaySessions: number;
  freeFlashcardDecks: number;
  freeGrammarExercises: number;
  freeTotalRequests: number;
  
  // Pro tier limits
  proRoleplaySessions: number;
  proFlashcardDecks: number;
  proGrammarExercises: number;
  proTotalRequests: number;
  
  // Warning thresholds (0-100)
  warningThresholdPercent: number;
  criticalThresholdPercent: number;
}

