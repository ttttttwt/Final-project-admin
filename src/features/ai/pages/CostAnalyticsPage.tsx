/**
 * CostAnalyticsPage Component
 * Admin page for viewing AI cost analytics and trends
 */

import { useState } from "react";
import { DollarSign, Download, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AINav, CostBreakdownChart, CostTrendChart, SetBudgetDialog, CostByPlanCard } from "../components";
import {
  useCostAnalytics,
  useCostProjection,
  useExportCostReport,
} from "../hooks/useAI";
import type { CostAnalyticsParams } from "../types";

/**
 * Period options for cost analytics
 */
const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
] as const;

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function CostAnalyticsPage() {
  // State
  const [period, setPeriod] = useState<CostAnalyticsParams["period"]>("month");

  // Queries
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch,
  } = useCostAnalytics({ period });

  const { data: projectionData } = useCostProjection();

  const exportMutation = useExportCostReport();

  // Handle export
  const handleExport = () => {
    exportMutation.mutate({ period });
  };

  // Error state
  if (analyticsError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <AINav />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading analytics</AlertTitle>
          <AlertDescription>
            {analyticsError instanceof Error
              ? analyticsError.message
              : "Failed to load cost analytics"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Budget usage percentage
  const budgetPercentage = analyticsData?.budgetUsedPercentage ?? 0;
  const isOverBudget = budgetPercentage >= 100;
  const isNearBudget = budgetPercentage >= 80 && budgetPercentage < 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation */}
      <AINav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Cost Analytics
          </h1>
          <p className="text-muted-foreground">
            Monitor AI usage costs and budget utilization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(value) =>
              setPeriod(value as CostAnalyticsParams["period"])
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={analyticsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${analyticsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <SetBudgetDialog currentBudget={analyticsData?.budgetLimit ?? 0} />
        </div>
      </div>

      {/* Budget Alert */}
      {(isOverBudget || isNearBudget) && (
        <Alert variant={isOverBudget ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isOverBudget ? "Budget Exceeded!" : "Budget Warning"}
          </AlertTitle>
          <AlertDescription>
            {isOverBudget
              ? `You have exceeded your monthly budget of ${formatCurrency(analyticsData?.budgetLimit ?? 0)}.`
              : `You have used ${budgetPercentage.toFixed(1)}% of your monthly budget.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost ({period})</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(analyticsData?.totalCost ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">
              {(analyticsData?.totalRequests ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Cost per Request</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(analyticsData?.averageCostPerRequest ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-3xl">
              {analyticsData?.activeUsers ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Budget</CardTitle>
              <CardDescription>
                {formatCurrency(analyticsData?.totalCost ?? 0)} of{" "}
                {formatCurrency(analyticsData?.budgetLimit ?? 100)} used
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {budgetPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Budget Used</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={Math.min(budgetPercentage, 100)}
            className={`h-3 ${isOverBudget ? "[&>div]:bg-destructive" : isNearBudget ? "[&>div]:bg-yellow-500" : ""}`}
          />
        </CardContent>
      </Card>

      {/* Projection Card */}
      {projectionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cost Projection
            </CardTitle>
            <CardDescription>
              Estimated costs based on current usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Month</p>
                <p className="text-xl font-bold">
                  {formatCurrency(projectionData.currentMonthCost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected End of Month</p>
                <p className="text-xl font-bold">
                  {formatCurrency(projectionData.projectedMonthCost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Daily Cost</p>
                <p className="text-xl font-bold">
                  {formatCurrency(projectionData.averageDailyCost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-xl font-bold">{projectionData.daysRemaining}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cost Breakdown by Feature */}
        <CostBreakdownChart
          data={analyticsData?.costByFeature ?? []}
          isLoading={analyticsLoading}
        />

        {/* Cost by Plan */}
        <CostByPlanCard
          data={analyticsData?.costByPlan}
          isLoading={analyticsLoading}
        />
      </div>

      {/* Cost Trend */}
      <CostTrendChart
        data={analyticsData?.dailyCosts ?? []}
        isLoading={analyticsLoading}
      />

      {/* Token Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
          <CardDescription>
            Input and output token consumption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Input Tokens</p>
              <p className="text-2xl font-bold">
                {(analyticsData?.totalInputTokens ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Output Tokens</p>
              <p className="text-2xl font-bold">
                {(analyticsData?.totalOutputTokens ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CostAnalyticsPage;
