/**
 * Admin types for Custom Material management.
 * 
 * @since Sprint 6
 */

// ==================== Material Types ====================

export interface AdminCustomMaterial {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  title: string;
  sourceType: MaterialSourceType;
  status: MaterialStatus;
  errorMessage?: string;
  contentLength?: number;
  createdAt: string;
  updatedAt: string;
}

export type MaterialSourceType = 'PDF' | 'DOCX' | 'IMAGE' | 'YOUTUBE' | 'WEBSITE' | 'TEXT';
export type MaterialStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// ==================== Job Types ====================

export interface AdminJob {
  id: string;
  materialId: string;
  materialTitle?: string;
  userId?: string;
  userEmail?: string;
  status: JobStatus;
  progress: number;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  isStuck?: boolean;
}

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface JobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  queuedJobs: number;
  stuckJobs: number;
  successRate: number;
}

// ==================== API Response Types ====================

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ActionResponse {
  success: boolean;
  message: string;
}

// ==================== Query Parameters ====================

export interface MaterialQueryParams {
  status?: MaterialStatus;
  userId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface JobQueryParams {
  status?: JobStatus;
  stuckOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
