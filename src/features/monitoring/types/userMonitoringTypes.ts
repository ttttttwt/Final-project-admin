/**
 * Types for admin user monitoring feature
 */

// Device type enum
export type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';

// User session information
export interface UserSessionDTO {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  deviceType: DeviceType;
  loginTime: string;
  lastActivityTime: string;
  isActive: boolean;
  logoutTime: string | null;
}

// Active users overview
export interface ActiveUsersDTO {
  totalActiveUsers: number;
  desktopUsers: number;
  mobileUsers: number;
  tabletUsers: number;
  recentSessions: UserSessionDTO[];
}

// Activity item in user history
export interface ActivityItem {
  id: number;
  contentType: string;
  description: string;
  timestamp: string;
  tokensUsed: number;
  success: boolean;
}

// Activity summary statistics
export interface ActivitySummary {
  totalRequests: number;
  roleplayRequests: number;
  grammarRequests: number;
  flashcardRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

// User activity history
export interface UserActivityDTO {
  userId: string;
  userEmail: string;
  activities: ActivityItem[];
  summary: ActivitySummary;
}

// Alert severity levels
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Alert types
export type AlertType =
  | 'HIGH_REQUEST_VOLUME'
  | 'MULTIPLE_IP_SESSIONS'
  | 'UNUSUAL_LOCATION'
  | 'QUOTA_ABUSE'
  | 'SUSPICIOUS_PATTERN';

// Abnormal activity alert
export interface AbnormalActivityAlertDTO {
  alertId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  userId: string;
  userEmail: string;
  description: string;
  details: string;
  detectedAt: string;
  isResolved: boolean;
}

// Paginated response for sessions
export interface PagedUserSessions {
  content: UserSessionDTO[];
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}
