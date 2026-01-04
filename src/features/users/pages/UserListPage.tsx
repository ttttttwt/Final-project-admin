/**
 * User List Page
 * Displays a paginated, searchable, and filterable list of all users
 * ADMIN role only
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, X, Trash2, Users, UserCheck, Crown, UserPlus } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";

import { UserTable } from "../components/UserTable";
import { useUsers } from "../hooks/useUsers";
import type {
  UserRole,
  UserStatus,
  PlanTypeFilter,
  UserSearchParams,
} from "../types/user.types";
import { analyticsApi } from "@/features/analytics/api";

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

  // Fetch analytics overview for stats cards
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["analyticsOverview"],
    queryFn: analyticsApi.getOverview,
  });

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

  // Handle plan type filter change
  const handlePlanTypeChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      planType: value === "all" ? undefined : (value as PlanTypeFilter),
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

      {/* Stats Cards */}
      {isLoadingAnalytics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.activeUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.proUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Premium subscribers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.newUsersThisMonth?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">New registrations</p>
            </CardContent>
          </Card>
        </div>
      )}

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
                <SelectItem value="LEARNER">User</SelectItem>
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

            {/* Plan Type Filter */}
            <Select
              value={params.planType || "all"}
              onValueChange={handlePlanTypeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
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
