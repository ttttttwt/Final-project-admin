export type UserRole = "ADMIN" | "CONTENT_MANAGER" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserSearchParams {
  page: number;
  size: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sort?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
  role?: string;
}
