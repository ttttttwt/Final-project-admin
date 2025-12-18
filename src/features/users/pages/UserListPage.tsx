/**
 * User List Page
 * Displays a paginated, searchable, and filterable list of all users
 * ADMIN role only
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { Plus, Search, X, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { UserTable } from "../components/UserTable";
import { useUsers } from "../hooks/useUsers";
import type {
  UserRole,
  UserStatus,
  UserSearchParams,
} from "../types/user.types";

/**
 * UserListPage - Main page for user management
 */
export function UserListPage() {
  const navigate = useNavigate();

  // Search and filter state
  const [params, setParams] = useState<UserSearchParams>({
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });
  const [searchInput, setSearchInput] = useState("");

  // Fetch users
  const { data, isLoading, error } = useUsers(params);

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      search: value || undefined,
    }));
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setParams((prev) => ({
      ...prev,
      page: 0,
      search: undefined,
    }));
  };

  // Handle role filter change
  const handleRoleChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      role: value === "all" ? undefined : (value as UserRole),
    }));
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      status: value === "all" ? undefined : (value as UserStatus),
    }));
  };

  // Handle pagination change
  const handlePaginationChange = (newParams: Partial<UserSearchParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  // Error state
  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load users
          </p>
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/users/deleted")}>
            <Trash2 className="mr-2 h-4 w-4" />
            View Trash
          </Button>
          <Button onClick={() => navigate("/users/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            {/* Role Filter */}
            <Select
              value={params.role || "all"}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="CONTENT_MANAGER">Content Manager</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={params.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Users
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({data.totalElements} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={data?.content || []}
            pagination={{
              pageIndex: data?.number || 0,
              pageSize: data?.size || 10,
              totalPages: data?.totalPages || 0,
              totalElements: data?.totalElements || 0,
            }}
            onPaginationChange={(page, size) => handlePaginationChange({ page, size })}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default UserListPage;
