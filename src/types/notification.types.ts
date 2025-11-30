/**
 * Notification Types for LEXIA Admin Panel
 *
 * TypeScript type definitions matching backend DTOs for the notification system.
 * @see NOTIFICATION-SPECIFICATION.md
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Notification type categories
 */
export type NotificationType =
  | "COURSE_PUBLISHED"
  | "LESSON_ADDED"
  | "ENROLLMENT_CONFIRMED"
  | "LESSON_COMPLETED"
  | "COURSE_COMPLETED"
  | "ACHIEVEMENT_UNLOCKED"
  | "STREAK_REMINDER"
  | "STREAK_LOST"
  | "STREAK_MILESTONE"
  | "LEVEL_UP"
  | "SYSTEM_ANNOUNCEMENT"
  | "MAINTENANCE_NOTICE";

/**
 * Notification priority levels
 */
export type NotificationPriority = "HIGH" | "NORMAL" | "LOW";

/**
 * Notification category for grouping
 */
export type NotificationCategory =
  | "LEARNING"
  | "ACHIEVEMENT"
  | "ENGAGEMENT"
  | "SYSTEM";

// ============================================================================
// Main Notification Types
// ============================================================================

/**
 * Notification DTO - matches backend NotificationDTO
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

/**
 * Unread count response - matches backend UnreadCountDTO
 */
export interface UnreadCountResponse {
  unreadCount: number;
  highPriorityCount: number;
}

// ============================================================================
// Admin API Request Types
// ============================================================================

/**
 * Request to broadcast notification to all users
 * POST /api/v1/admin/notifications/broadcast
 */
export interface BroadcastNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: Record<string, unknown>;
}

/**
 * Request to send notification to specific users
 * POST /api/v1/admin/notifications/send
 */
export interface SendNotificationRequest extends BroadcastNotificationRequest {
  userIds: string[];
}

// ============================================================================
// Helper Constants
// ============================================================================

/**
 * All notification types with labels
 */
export const NOTIFICATION_TYPES: {
  value: NotificationType;
  label: string;
  category: NotificationCategory;
}[] = [
  {
    value: "SYSTEM_ANNOUNCEMENT",
    label: "System Announcement",
    category: "SYSTEM",
  },
  {
    value: "MAINTENANCE_NOTICE",
    label: "Maintenance Notice",
    category: "SYSTEM",
  },
  {
    value: "COURSE_PUBLISHED",
    label: "Course Published",
    category: "LEARNING",
  },
  { value: "LESSON_ADDED", label: "Lesson Added", category: "LEARNING" },
  {
    value: "ENROLLMENT_CONFIRMED",
    label: "Enrollment Confirmed",
    category: "LEARNING",
  },
  {
    value: "LESSON_COMPLETED",
    label: "Lesson Completed",
    category: "ACHIEVEMENT",
  },
  {
    value: "COURSE_COMPLETED",
    label: "Course Completed",
    category: "ACHIEVEMENT",
  },
  {
    value: "ACHIEVEMENT_UNLOCKED",
    label: "Achievement Unlocked",
    category: "ACHIEVEMENT",
  },
  {
    value: "STREAK_REMINDER",
    label: "Streak Reminder",
    category: "ENGAGEMENT",
  },
  { value: "STREAK_LOST", label: "Streak Lost", category: "ENGAGEMENT" },
  {
    value: "STREAK_MILESTONE",
    label: "Streak Milestone",
    category: "ACHIEVEMENT",
  },
  { value: "LEVEL_UP", label: "Level Up", category: "ACHIEVEMENT" },
];

/**
 * Priority options with labels
 */
export const PRIORITY_OPTIONS: {
  value: NotificationPriority;
  label: string;
}[] = [
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
];

/**
 * Get notification icon
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    COURSE_PUBLISHED: "📚",
    LESSON_ADDED: "📝",
    ENROLLMENT_CONFIRMED: "✅",
    LESSON_COMPLETED: "✔️",
    COURSE_COMPLETED: "🎉",
    ACHIEVEMENT_UNLOCKED: "🏆",
    STREAK_REMINDER: "🔥",
    STREAK_LOST: "💔",
    STREAK_MILESTONE: "⭐",
    LEVEL_UP: "📈",
    SYSTEM_ANNOUNCEMENT: "📢",
    MAINTENANCE_NOTICE: "🔧",
  };
  return icons[type] || "🔔";
}
