/**
 * QuotaManagementPage Component
 * Admin page for managing user AI quotas
 */

import { useState, useMemo } from "react";
import { Users, RefreshCw } from "lucide-react";
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
  const [editingQuota, setEditingQuota] = useState<UserAIQuota | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Build effective params
  const effectiveParams = useMemo(
    () => ({
      ...searchParams,
      search: searchValue || undefined,
    }),
    [searchParams, searchValue]
  );

  // Queries and mutations
  const {
    data: quotasData,
    isLoading,
    error,
    refetch,
  } = useQuotas(effectiveParams);

  const updateQuotaMutation = useUpdateQuota();
  const resetQuotaMutation = useResetQuota();
  const setUnlimitedMutation = useSetUnlimited();

  // Handlers
  const handleSearch = (search: string) => {
    setSearchValue(search);
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
    if (confirm("Are you sure you want to reset this user's daily counters?")) {
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

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!quotasData?.content) {
      return { total: 0, unlimited: 0, exceeded: 0 };
    }
    return {
      total: quotasData.totalElements,
      unlimited: quotasData.content.filter((q) => q.isUnlimited).length,
      exceeded: quotasData.content.filter(
        (q) => !q.isUnlimited && q.totalUsedToday >= q.totalDailyLimit
      ).length,
    };
  }, [quotasData]);

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
            Manage daily AI usage limits for users
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users with Quotas</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unlimited Access Users</CardDescription>
            <CardTitle className="text-3xl">{stats.unlimited}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Exceeded Today</CardDescription>
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
            View and manage AI usage quotas for all users
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
            pagination={{
              page: quotasData?.pageable?.pageNumber ?? 0,
              size: quotasData?.pageable?.pageSize ?? 10,
              totalPages: quotasData?.totalPages ?? 0,
              totalElements: quotasData?.totalElements ?? 0,
            }}
            onPaginationChange={handlePaginationChange}
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
