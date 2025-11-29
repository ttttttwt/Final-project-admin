/**
 * Activity type enum matching backend AdminActivityLog.ActionType
 */
export type ActivityType =
  | "COURSE_CREATED"
  | "COURSE_UPDATED"
  | "COURSE_PUBLISHED"
  | "COURSE_UNPUBLISHED"
  | "COURSE_DELETED"
  | "SECTION_CREATED"
  | "SECTION_UPDATED"
  | "SECTION_DELETED"
  | "LESSON_CREATED"
  | "LESSON_UPDATED"
  | "LESSON_DELETED";

/**
 * Activity item for recent activity feed
 */
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  link?: string;
  userName?: string;
  courseName?: string;
}

/**
 * Admin dashboard statistics response
 */
export interface AdminDashboardStats {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  recentActivities: Activity[];
  coursesByLevel: Record<string, number>;
}

/**
 * Chart data point for overview charts
 */
export interface ChartDataPoint {
  level: string;
  courses: number;
}
