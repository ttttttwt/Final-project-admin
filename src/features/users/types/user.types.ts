export type UserRole = "ADMIN" | "CONTENT_MANAGER" | "LEARNER";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type PlanTypeFilter = "FREE" | "PRO";

export interface UserSearchParams {
  page: number;
  size: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  planType?: PlanTypeFilter;
  sort?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: string;
  // Enhanced user info
  cefrLevel?: string;
  enrolledCoursesCount?: number;
  enrolledPathsCount?: number;
  subscriptionType?: string;
  lastActiveAt?: string;
  streakDays?: number;
}

// ==================== User Detail Types ====================

export interface PlacementResult {
  id: string;
  score: number;
  totalQuestions: number;
  assignedLevel: string;
  createdAt: string;
}

export interface SubscriptionInfo {
  planType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  stripeCustomerId?: string;
}

export interface EnrollmentSummary {
  courseId: number;
  courseName: string;
  courseThumbnail?: string;
  cefrLevel: string;
  progressPercentage: number;
  isCompleted: boolean;
  enrolledAt: string;
  completedAt?: string;
}

export interface LearningPathSummary {
  pathId: number;
  pathName: string;
  pathDescription?: string;
  currentCourseIndex: number;
  totalCourses: number;
  overallProgress: number;
  startedAt: string;
  completedAt?: string;
}

export interface LearningStats {
  totalEnrolledCourses: number;
  completedCourses: number;
  totalEnrolledPaths: number;
  completedPaths: number;
  completedLessons: number;
  currentStreak: number;
  bestStreak: number;
  totalStudyTimeMinutes: number;
  rolePlaySessions: number;
  flashcardDecksCreated: number;
  grammarExercisesCompleted: number;
}

export interface FeatureQuota {
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
}

export interface AiQuotaSummary {
  isPremium: boolean;
  
  // ========== Subscription-Based Quota (NEW) ==========
  
  /** User's subscription plan: FREE, MONTHLY, YEARLY */
  planType?: string;
  
  /** Date when monthly quota resets (ISO format) */
  quotaResetDate?: string;
  
  /** Days until next quota reset */
  daysUntilReset?: number;
  
  /** Role play sessions used/limit for current month */
  roleplaySessionsUsed?: number;
  roleplaySessionsLimit?: number;
  
  /** Flashcard decks created used/limit */
  flashcardDecksUsed?: number;
  flashcardDecksLimit?: number;
  
  /** Grammar exercises generated used/limit for current month */
  grammarExercisesUsed?: number;
  grammarExercisesLimit?: number;
  
  /** Custom materials created used/limit for current month */
  customMaterialsUsed?: number;
  customMaterialsLimit?: number;
  
  /** Total AI requests used/limit for current month */
  totalRequestsUsed?: number;
  totalRequestsLimit?: number;
  
  // ========== Legacy Fields ==========
  
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  featureQuotas?: Record<string, FeatureQuota>;
  lastResetAt?: string;
  isSuspended: boolean;
}

export interface AiUsage {
  id: number;
  contentType: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  responseTimeMs: number;
  success: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface UserDetail {
  // Basic info
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  roles: string[];
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  lastActiveAt?: string;
  authProvider?: string;
  // CEFR & Placement
  currentCefrLevel?: string;
  learningGoal?: string;
  placementHistory: PlacementResult[];
  // Subscription
  subscription?: SubscriptionInfo;
  // Learning Progress
  enrolledCourses: EnrollmentSummary[];
  enrolledPaths: LearningPathSummary[];
  learningStats?: LearningStats;
  // AI Usage
  aiQuota?: AiQuotaSummary;
  recentAiUsage: AiUsage[];
  // Activity
  recentActivities: ActivityLog[];
}

export interface CreateUserInput {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
  role?: string;
}

