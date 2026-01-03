/**
 * QuotaManagementPage Component
 * Admin page for managing user AI quotas with Pro/Free plan awareness
 */

import { useState, useMemo } from "react";
import { Users, RefreshCw, Crown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AINav, QuotaTable, QuotaEditDialog } from "../components";
import {
  useQuotas,
  useQuotaSummaryStats,
  useUpdateQuota,
  useResetQuota,
  useSetUnlimited,
} from "../hooks/useAI";
import type { UserAIQuota, QuotaSearchParams, UpdateQuotaInput } from "../types";

export function QuotaManagementPage() {
  // State
  const [searchParams, setSearchParams] = useState<QuotaSearchParams>({
    page: 0,
    size: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [planTypeFilter, setPlanTypeFilter] = useState<"FREE" | "PRO" | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingQuota, setEditingQuota] = useState<UserAIQuota | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Build effective params
  const effectiveParams = useMemo(
    () => ({
      ...searchParams,
      search: searchValue || undefined,
      planType: planTypeFilter !== "ALL" ? planTypeFilter : undefined,
      sortBy,
      sortDir,
    }),
    [searchParams, searchValue, planTypeFilter, sortBy, sortDir]
  );

  // Queries and mutations
  const {
    data: quotasData,
    isLoading,
    error,
    refetch,
  } = useQuotas(effectiveParams);

  // Fetch summary stats from API (accurate count across all pages)
  const { data: summaryStats, refetch: refetchStats } = useQuotaSummaryStats();

  const updateQuotaMutation = useUpdateQuota();
  const resetQuotaMutation = useResetQuota();
  const setUnlimitedMutation = useSetUnlimited();

  // Combined refetch for both queries
  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  // Handlers
  const handleSearch = (search: string) => {
    setSearchValue(search);
    setSearchParams((prev) => ({ ...prev, page: 0 }));
  };

  const handlePlanTypeFilterChange = (filter: "FREE" | "PRO" | "ALL") => {
    setPlanTypeFilter(filter);
    setSearchParams((prev) => ({ ...prev, page: 0 }));
  };

  const handleSortChange = (newSortBy: string, newSortDir: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setSearchParams((prev) => ({ ...prev, page: 0 }));
  };

  const handlePaginationChange = (params: Partial<QuotaSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
  };

  const handleEdit = (quota: UserAIQuota) => {
    setEditingQuota(quota);
    setIsDialogOpen(true);
  };

  const handleEditSubmit = (userId: string, data: UpdateQuotaInput) => {
    updateQuotaMutation.mutate(
      { userId, data },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingQuota(null);
        },
      }
    );
  };

  const handleReset = (userId: string) => {
    if (confirm("Are you sure you want to reset this user's monthly counters?")) {
      resetQuotaMutation.mutate(userId);
    }
  };

  const handleToggleUnlimited = (userId: string, isUnlimited: boolean) => {
    const action = isUnlimited ? "enable unlimited access for" : "set limits for";
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      setUnlimitedMutation.mutate({ userId, isUnlimited });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <AINav />
        <Alert variant="destructive">
          <AlertTitle>Error loading quotas</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load user quotas"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate summary stats with plan breakdown - use API stats for accurate counts
  const stats = useMemo(() => {
    if (summaryStats) {
      return {
        total: summaryStats.totalUsers,
        free: summaryStats.freeUsers,
        pro: summaryStats.proUsers,
        exceeded: summaryStats.quotaExceeded,
        unlimited: summaryStats.unlimitedUsers,
      };
    }
    // Fallback to totalElements if summary stats not loaded
    return {
      total: quotasData?.totalElements ?? 0,
      free: 0,
      pro: 0,
      exceeded: 0,
      unlimited: 0,
    };
  }, [summaryStats, quotasData]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation */}
      <AINav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Quota Management
          </h1>
          <p className="text-muted-foreground">
            Manage monthly AI usage limits for Free and Pro users
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              Pro Users
            </CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.pro}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Free Users</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{stats.free}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quota Exceeded</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {stats.exceeded}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quota Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Quotas</CardTitle>
          <CardDescription>
            View and manage monthly AI usage quotas for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuotaTable
            quotas={quotasData?.content ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onReset={handleReset}
            onToggleUnlimited={handleToggleUnlimited}
            onSearch={handleSearch}
            searchValue={searchValue}
            planTypeFilter={planTypeFilter}
            onPlanTypeFilterChange={handlePlanTypeFilterChange}
            pagination={{
              page: quotasData?.pageable?.pageNumber ?? 0,
              size: quotasData?.pageable?.pageSize ?? 10,
              totalPages: quotasData?.totalPages ?? 0,
              totalElements: quotasData?.totalElements ?? 0,
            }}
            onPaginationChange={handlePaginationChange}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <QuotaEditDialog
        quota={editingQuota}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleEditSubmit}
        isSubmitting={updateQuotaMutation.isPending}
      />
    </div>
  );
}

export default QuotaManagementPage;
