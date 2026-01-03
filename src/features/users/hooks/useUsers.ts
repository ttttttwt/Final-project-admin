import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import type { UserSearchParams, CreateUserInput, UpdateUserInput } from "../types/user.types";

export const useUsers = (params: UserSearchParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.getUsers(params.page, params.size, params.search, params.role, params.planType),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch comprehensive user details for detail page
 */
export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: ["userDetail", id],
    queryFn: () => usersApi.getUserDetail(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["deletedUsers"] });
    },
  });
};

// ==================== Soft Delete Management Hooks ====================

/**
 * Hook to fetch deleted users (trash view)
 */
export const useDeletedUsers = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["deletedUsers", page, size],
    queryFn: () => usersApi.getDeletedUsers(page, size),
  });
};

/**
 * Hook to permanently delete a user
 */
export const useHardDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      usersApi.hardDeleteUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["deletedUsers"] });
    },
  });
};

/**
 * Hook to restore a soft-deleted user
 */
export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["deletedUsers"] });
    },
  });
};

