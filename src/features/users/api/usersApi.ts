import api from "@/lib/api";
import type { User, UserDetail, CreateUserInput, UpdateUserInput } from "../types/user.types";
import type { Page } from "@/types/api.types";

export const usersApi = {
  getUsers: async (page = 0, size = 10, search?: string, role?: string, planType?: string) => {
    const params = { page, size, search, role, planType };
    const response = await api.get<Page<User>>("/admin/users", { params });
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },
  getUserDetail: async (id: string) => {
    const response = await api.get<UserDetail>(`/admin/users/${id}/detail`);
    return response.data;
  },
  createUser: async (data: CreateUserInput) => {
    const response = await api.post<User>("/admin/users", data);
    return response.data;
  },
  updateUser: async (id: string, data: UpdateUserInput) => {
    const response = await api.put<User>(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  // ==================== Soft Delete Management ====================

  /**
   * Get all soft-deleted users (trash view)
   */
  getDeletedUsers: async (page = 0, size = 10) => {
    const params = { page, size };
    const response = await api.get<Page<User>>("/admin/users/deleted", { params });
    return response.data;
  },

  /**
   * Permanently delete a user (hard delete)
   */
  hardDeleteUser: async (id: string, reason: string) => {
    await api.delete(`/admin/users/${id}/permanent`, { params: { reason } });
  },

  /**
   * Restore a soft-deleted user
   */
  restoreUser: async (id: string) => {
    const response = await api.post<User>(`/admin/users/${id}/restore`);
    return response.data;
  },
};
