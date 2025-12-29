import api from '@/lib/api';
import type {
  AdminCustomMaterial,
  AdminJob,
  JobStats,
  PageResponse,
  ActionResponse,
  MaterialQueryParams,
  JobQueryParams,
} from '../types/customMaterialAdmin';

const BASE_URL = '/admin/custom-materials';

/**
 * Admin API functions for Custom Material management.
 * 
 * @since Sprint 6
 */

// ==================== Material API ====================

export async function getMaterials(params?: MaterialQueryParams): Promise<PageResponse<AdminCustomMaterial>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.userId) searchParams.append('userId', params.userId);
  if (params?.page !== undefined) searchParams.append('page', String(params.page));
  if (params?.size !== undefined) searchParams.append('size', String(params.size));
  if (params?.sort) searchParams.append('sort', params.sort);
  
  const query = searchParams.toString();
  const url = `${BASE_URL}/materials${query ? `?${query}` : ''}`;
  const response = await api.get<PageResponse<AdminCustomMaterial>>(url);
  return response.data;
}

export async function getMaterialById(id: string): Promise<AdminCustomMaterial> {
  const response = await api.get<AdminCustomMaterial>(`${BASE_URL}/materials/${id}`);
  return response.data;
}

export async function deleteMaterial(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/materials/${id}`);
}

// ==================== Job API ====================

export async function getJobs(params?: JobQueryParams): Promise<PageResponse<AdminJob>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.stuckOnly) searchParams.append('stuckOnly', 'true');
  if (params?.page !== undefined) searchParams.append('page', String(params.page));
  if (params?.size !== undefined) searchParams.append('size', String(params.size));
  
  const query = searchParams.toString();
  const url = `${BASE_URL}/jobs${query ? `?${query}` : ''}`;
  const response = await api.get<PageResponse<AdminJob>>(url);
  return response.data;
}

export async function getJobStats(): Promise<JobStats> {
  const response = await api.get<JobStats>(`${BASE_URL}/jobs/stats`);
  return response.data;
}

export async function retryJob(jobId: string): Promise<ActionResponse> {
  const response = await api.post<ActionResponse>(`${BASE_URL}/jobs/${jobId}/retry`);
  return response.data;
}

export async function resetRetryCount(jobId: string): Promise<ActionResponse> {
  const response = await api.post<ActionResponse>(`${BASE_URL}/jobs/${jobId}/reset-retries`);
  return response.data;
}

export async function deleteJob(jobId: string): Promise<void> {
  await api.delete(`${BASE_URL}/jobs/${jobId}`);
}
