/**
 * QuotaTable Component
 * Displays user AI quotas with monthly usage, plan badges, and admin actions
 */

import { useState } from "react";
import { MoreHorizontal, RefreshCw, Infinity, Edit, Search, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserAIQuota, QuotaSearchParams } from "../types";
import { PlanBadge } from "./PlanBadge";

interface QuotaTableProps {
  quotas: UserAIQuota[];
  isLoading: boolean;
  onEdit: (quota: UserAIQuota) => void;
  onReset: (userId: string) => void;
  onToggleUnlimited: (userId: string, isUnlimited: boolean) => void;
  onSearch: (search: string) => void;
  searchValue: string;
  planTypeFilter: "FREE" | "PRO" | "ALL";
  onPlanTypeFilterChange: (planType: "FREE" | "PRO" | "ALL") => void;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
  onPaginationChange: (params: Partial<QuotaSearchParams>) => void;
}

/**
 * Calculate usage percentage
 */
function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min((used / limit) * 100, 100);
}

/**
 * Get usage status color
 */
function getUsageStatus(
  used: number,
  limit: number
): "default" | "secondary" | "destructive" | "outline" {
  const percentage = getUsagePercentage(used, limit);
  if (percentage >= 100) return "destructive";
  if (percentage >= 80) return "secondary";
  return "outline";
}

/**
 * QuotaUsageCell - Displays monthly usage with progress bar
 */
function QuotaUsageCell({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number;
  label: string;
}) {
  const percentage = getUsagePercentage(used, limit);
  const status = getUsageStatus(used, limit);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <Badge variant={status} className="text-xs">
          {used}/{limit}
        </Badge>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}

/**
 * Loading skeleton for table rows
 */
function QuotaTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function QuotaTable({
  quotas,
  isLoading,
  onEdit,
  onReset,
  onToggleUnlimited,
  onSearch,
  searchValue,
  planTypeFilter,
  onPlanTypeFilterChange,
  pagination,
  onPaginationChange,
}: QuotaTableProps) {
  const [searchInput, setSearchInput] = useState(searchValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {/* Plan Type Filter */}
        <Select value={planTypeFilter} onValueChange={(value) => onPlanTypeFilterChange(value as "FREE" | "PRO" | "ALL")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Plans</SelectItem>
            <SelectItem value="FREE">Free Only</SelectItem>
            <SelectItem value="PRO">Pro Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead className="w-[100px]">Plan</TableHead>
              <TableHead>Role-Play</TableHead>
              <TableHead>Grammar</TableHead>
              <TableHead>Flashcards</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead className="w-[120px]">Reset</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <QuotaTableSkeleton />
            ) : quotas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No quotas found</p>
                </TableCell>
              </TableRow>
            ) : (
              quotas.map((quota) => (
                <TableRow key={quota.userId} className={quota.quotaCritical ? "bg-destructive/5" : quota.quotaWarning ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quota.userFullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {quota.userEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlanBadge planType={quota.planType} size="sm" />
                  </TableCell>
                  <TableCell>
                    {quota.isUnlimited ? (
                      <Badge variant="secondary" className="gap-1">
                        <Infinity className="h-3 w-3" />
                        Unlimited
                      </Badge>
                    ) : (
                      <QuotaUsageCell
                        used={quota.roleplaySessionsUsed}
                        limit={quota.roleplaySessionsLimit}
                        label="Sessions/mo"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {quota.isUnlimited ? (
                      <Badge variant="secondary" className="gap-1">
                        <Infinity className="h-3 w-3" />
                        Unlimited
                      </Badge>
                    ) : (
                      <QuotaUsageCell
                        used={quota.grammarExercisesUsed}
                        limit={quota.grammarExercisesLimit}
                        label="Exercises/mo"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {quota.isUnlimited ? (
                      <Badge variant="secondary" className="gap-1">
                        <Infinity className="h-3 w-3" />
                        Unlimited
                      </Badge>
                    ) : (
                      <QuotaUsageCell
                        used={quota.flashcardDecksUsed}
                        limit={quota.flashcardDecksLimit}
                        label="Decks/mo"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {quota.isUnlimited ? (
                      <Badge variant="secondary" className="gap-1">
                        <Infinity className="h-3 w-3" />
                        Unlimited
                      </Badge>
                    ) : (
                      <QuotaUsageCell
                        used={quota.customMaterialsUsed}
                        limit={quota.customMaterialsLimit}
                        label="Materials/mo"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {quota.daysUntilReset !== undefined ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{quota.daysUntilReset}d</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quota resets in {quota.daysUntilReset} days</p>
                            {quota.quotaResetDate && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(quota.quotaResetDate).toLocaleDateString()}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(quota)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Limits
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReset(quota.userId)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset Counters
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            onToggleUnlimited(quota.userId, !quota.isUnlimited)
                          }
                        >
                          <Infinity className="mr-2 h-4 w-4" />
                          {quota.isUnlimited
                            ? "Set Limited"
                            : "Set Unlimited"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && quotas.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.page * pagination.size + 1} to{" "}
            {Math.min(
              (pagination.page + 1) * pagination.size,
              pagination.totalElements
            )}{" "}
            of {pagination.totalElements} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPaginationChange({ page: pagination.page - 1 })
              }
              disabled={pagination.page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPaginationChange({ page: pagination.page + 1 })
              }
              disabled={pagination.page >= pagination.totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuotaTable;
