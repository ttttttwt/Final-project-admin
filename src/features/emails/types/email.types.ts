/**
 * Email Management Types
 * Type definitions for email management feature
 */

// Email Status enum
export type EmailStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "BOUNCED"
  | "CANCELLED";

// Email Type enum
export type EmailType =
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "WELCOME"
  | "ENROLLMENT_CONFIRMATION"
  | "COURSE_COMPLETED"
  | "CERTIFICATE_DELIVERY"
  | "STREAK_REMINDER"
  | "STREAK_LOST"
  | "STREAK_MILESTONE"
  | "LEVEL_UP"
  | "WEEKLY_PROGRESS"
  | "ACCOUNT_DEACTIVATION"
  | "SYSTEM_ANNOUNCEMENT"
  | "MAINTENANCE_NOTICE"
  | "SECURITY_ALERT"
  | "PASSWORD_CHANGED"
  | "DEVICE_LOGIN";

// Email Priority enum
export type EmailPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

// Stats Period enum
export type StatsPeriod =
  | "LAST_24_HOURS"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS";

// Email Queue DTO
export interface EmailQueueDTO {
  id: string;
  recipientId?: string;
  recipientEmail: string;
  recipientName?: string;
  emailType: EmailType;
  subject: string;
  templateName: string;
  status: EmailStatus;
  priority: EmailPriority;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  lastError?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
}

// Email Stats Summary
export interface EmailStatsSummary {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  failed: number;
}

// Email Rates
export interface EmailRates {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
}

// Email Type Stats
export interface EmailTypeStats {
  type: string;
  sent: number;
  opened: number;
  openRate: number;
  clicked: number;
  clickRate: number;
}

// Email Stats DTO
export interface EmailStatsDTO {
  period: string;
  summary: EmailStatsSummary;
  rates: EmailRates;
  byType: EmailTypeStats[];
  trend?: {
    dates: string[];
    sent: number[];
    delivered: number[];
    failed: number[];
  };
}

// Admin Email Request
export interface AdminEmailRequest {
  userIds?: string[];
  broadcast?: boolean;
  emailType: EmailType;
  subject?: string;
  priority?: EmailPriority;
  templateData?: Record<string, unknown>;
  locale?: string;
}

// Send Email Response
export interface SendEmailResponse {
  message: string;
  queuedCount: number;
  emailIds?: string[];
}

// Email Queue Search Params
export interface EmailQueueSearchParams {
  status?: EmailStatus;
  page?: number;
  size?: number;
  sort?: string;
}

// Display names for Email Types
export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  EMAIL_VERIFICATION: "Email Verification",
  PASSWORD_RESET: "Password Reset",
  WELCOME: "Welcome Email",
  ENROLLMENT_CONFIRMATION: "Enrollment Confirmation",
  COURSE_COMPLETED: "Course Completed",
  CERTIFICATE_DELIVERY: "Certificate Delivery",
  STREAK_REMINDER: "Streak Reminder",
  STREAK_LOST: "Streak Lost",
  STREAK_MILESTONE: "Streak Milestone",
  LEVEL_UP: "Level Up",
  WEEKLY_PROGRESS: "Weekly Progress",
  ACCOUNT_DEACTIVATION: "Account Deactivation",
  SYSTEM_ANNOUNCEMENT: "System Announcement",
  MAINTENANCE_NOTICE: "Maintenance Notice",
  SECURITY_ALERT: "Security Alert",
  PASSWORD_CHANGED: "Password Changed",
  DEVICE_LOGIN: "New Device Login",
};

// Display names for Email Status
export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SENT: "Sent",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  BOUNCED: "Bounced",
  CANCELLED: "Cancelled",
};

// Display names for Email Priority
export const EMAIL_PRIORITY_LABELS: Record<EmailPriority, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  NORMAL: "Normal",
  LOW: "Low",
};

// Stats Period Labels
export const STATS_PERIOD_LABELS: Record<StatsPeriod, string> = {
  LAST_24_HOURS: "Last 24 Hours",
  LAST_7_DAYS: "Last 7 Days",
  LAST_30_DAYS: "Last 30 Days",
  LAST_90_DAYS: "Last 90 Days",
};
