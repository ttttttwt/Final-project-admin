import api from "@/lib/api";
import type { User, CreateUserInput, UpdateUserInput } from "../types/user.types";
import type { Page } from "@/types/api.types";

export const usersApi = {
  getUsers: async (page = 0, size = 10, search?: string, role?: string) => {
    const params = { page, size, search, role };
    const response = await api.get<Page<User>>("/admin/users", { params });
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await api.get<User>(`/admin/users/${id}`);
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
};
