export type UserRole = "ADMIN" | "CONTENT_MANAGER" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserSearchParams {
  page: number;
  size: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
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

