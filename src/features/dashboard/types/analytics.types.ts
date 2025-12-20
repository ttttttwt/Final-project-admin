export interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  freeUsers: number;
  proUsers: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalAIRequests: number;
  aiRequestsThisMonth: number;
}

export interface MonthlyStats {
  month: string;
  newUsers: number;
  activeUsers: number;
  revenue: number;
  aiRequests: number;
}

export interface UserDistribution {
  freeUsers: number;
  monthlyProUsers: number;
  yearlyProUsers: number;
  usersByLevel: Record<string, number>;
}

export interface DailyAIUsage {
  date: string;
  requests: number;
  tokensUsed: number;
}

export interface AIUsageStats {
  totalRequests: number;
  roleplayRequests: number;
  grammarRequests: number;
  flashcardRequests: number;
  translationRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  dailyUsage: DailyAIUsage[];
}

export interface AnalyticsResponse {
  overview: OverviewStats;
  monthlyStats: MonthlyStats[];
  userDistribution: UserDistribution;
  aiUsage: AIUsageStats;
}
