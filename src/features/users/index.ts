/**
 * Users Feature - Public API
 * Re-exports all public components, hooks, and types
 */

// Pages
export { default as UserListPage } from "./pages/UserListPage";
export { default as UserCreatePage } from "./pages/UserCreatePage";
export { default as UserEditPage } from "./pages/UserEditPage";

// Components
export { UserTable } from "./components/UserTable";
export { UserForm } from "./components/UserForm";

// Hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "./hooks/useUsers";

// API
export { usersApi } from "./api/usersApi";

// Types
export type {
  User,
  UserRole,
  UserStatus,
  CreateUserInput,
  UpdateUserInput,
  UserSearchParams,
} from "./types/user.types";
