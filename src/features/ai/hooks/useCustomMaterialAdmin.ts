import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as api from '../api/customMaterialAdminApi';
import type { MaterialQueryParams, JobQueryParams } from '../types/customMaterialAdmin';

/**
 * React Query hooks for Admin Custom Material management.
 * 
 * @since Sprint 6
 */

// ==================== Query Keys ====================

export const customMaterialKeys = {
  all: ['admin-custom-materials'] as const,
  materials: () => [...customMaterialKeys.all, 'materials'] as const,
  materialList: (params?: MaterialQueryParams) => [...customMaterialKeys.materials(), params] as const,
  material: (id: string) => [...customMaterialKeys.materials(), id] as const,
  jobs: () => [...customMaterialKeys.all, 'jobs'] as const,
  jobList: (params?: JobQueryParams) => [...customMaterialKeys.jobs(), params] as const,
  jobStats: () => [...customMaterialKeys.jobs(), 'stats'] as const,
};

// ==================== Material Hooks ====================

export function useMaterials(params?: MaterialQueryParams) {
  return useQuery({
    queryKey: customMaterialKeys.materialList(params),
    queryFn: () => api.getMaterials(params),
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: customMaterialKeys.material(id),
    queryFn: () => api.getMaterialById(id),
    enabled: !!id,
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.deleteMaterial,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Material deleted successfully' });
      queryClient.invalidateQueries({ queryKey: customMaterialKeys.materials() });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: `Failed to delete material: ${error.message}`, variant: 'destructive' });
    },
  });
}

// ==================== Job Hooks ====================

export function useJobs(params?: JobQueryParams) {
  return useQuery({
    queryKey: customMaterialKeys.jobList(params),
    queryFn: () => api.getJobs(params),
    refetchInterval: 30000, // Refresh every 30 seconds to show latest job status
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: customMaterialKeys.jobStats(),
    queryFn: api.getJobStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useRetryJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.retryJob,
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Success', description: data.message });
      } else {
        toast({ title: 'Warning', description: data.message, variant: 'destructive' });
      }
      queryClient.invalidateQueries({ queryKey: customMaterialKeys.jobs() });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: `Failed to retry job: ${error.message}`, variant: 'destructive' });
    },
  });
}

export function useResetRetryCount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.resetRetryCount,
    onSuccess: (data) => {
      toast({ title: 'Success', description: data.message });
      queryClient.invalidateQueries({ queryKey: customMaterialKeys.jobs() });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: `Failed to reset retry count: ${error.message}`, variant: 'destructive' });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.deleteJob,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Job deleted successfully' });
      queryClient.invalidateQueries({ queryKey: customMaterialKeys.jobs() });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: `Failed to delete job: ${error.message}`, variant: 'destructive' });
    },
  });
}
