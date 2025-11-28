/**
 * AIUsageLogsPage Component
 * Displays AI usage logs with filtering, pagination, and summary statistics
 *
 * ADMIN only page that shows:
 * - Summary statistics (today/week/month)
 * - Data table with AI usage logs
 * - Filters by feature and date range
 * - CSV export functionality
 */

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Download,
  RefreshCw,
  Bot,
  AlertTriangle,
  Calendar,
  Filter,
} from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/shared";
import { AIUsageStatsCard, MonitoringNav } from "../components";
import {
  useAIUsageLogs,
  useAIUsageStats,
  useExportAIUsageLogs,
} from "../hooks/useMonitoring";
import type {
  AIUsageLog,
  AIUsageLogsSearchParams,
  AIFeature,
  AIUsageStatsPeriod,
  AIUsageSummary,
} from "../types";

/**
 * AI Feature options for filtering
 */
const AI_FEATURES: { value: AIFeature | "all"; label: string }[] = [
  { value: "all", label: "All Features" },
  { value: "MAGIC_FLASHCARD", label: "Magic Flashcard" },
  { value: "ROLEPLAY", label: "Role Play" },
  { value: "GRAMMAR_SANDBOX", label: "Grammar Sandbox" },
  { value: "PRONUNCIATION_FEEDBACK", label: "Pronunciation Feedback" },
  { value: "CONTENT_GENERATION", label: "Content Generation" },
];

/**
 * Period options for stats
 */
const PERIOD_OPTIONS: { value: AIUsageStatsPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(value);
}

/**
 * Format date to locale string
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

/**
 * Get badge variant for feature
 */
function getFeatureBadgeVariant(
  feature: AIFeature
): "default" | "secondary" | "outline" {
  switch (feature) {
    case "MAGIC_FLASHCARD":
      return "default";
    case "ROLEPLAY":
      return "secondary";
    default:
      return "outline";
  }
}

export default function AIUsageLogsPage() {
  // Filter state
  const [searchParams, setSearchParams] = useState<AIUsageLogsSearchParams>({
    page: 0,
    size: 10,
  });
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | "all">(
    "all"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statsPeriod, setStatsPeriod] = useState<AIUsageStatsPeriod>("today");

  // Build search params
  const effectiveParams: AIUsageLogsSearchParams = useMemo(
    () => ({
      ...searchParams,
      featureName: selectedFeature === "all" ? undefined : selectedFeature,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [searchParams, selectedFeature, startDate, endDate]
  );

  // Query hooks
  const {
    data: logsData,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useAIUsageLogs(effectiveParams);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useAIUsageStats(statsPeriod);

  const exportMutation = useExportAIUsageLogs();

  // Table columns
  const columns: ColumnDef<AIUsageLog>[] = [
    {
      accessorKey: "id",
      header: "ID",
      className: "w-16",
    },
    {
      accessorKey: "userEmail",
      header: "User",
      cell: (row) => row.userEmail || row.userId?.slice(0, 8) + "...",
    },
    {
      accessorKey: "featureName",
      header: "Feature",
      cell: (row) => (
        <Badge variant={getFeatureBadgeVariant(row.featureName)}>
          {row.featureName.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "inputTokens",
      header: "Input Tokens",
      cell: (row) => row.inputTokens.toLocaleString(),
    },
    {
      accessorKey: "outputTokens",
      header: "Output Tokens",
      cell: (row) => row.outputTokens.toLocaleString(),
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: (row) => formatCurrency(row.cost),
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  // Handle pagination change
  const handlePaginationChange = (page: number, size: number) => {
    setSearchParams((prev) => ({ ...prev, page, size }));
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSelectedFeature("all");
    setStartDate("");
    setEndDate("");
    setSearchParams({ page: 0, size: 10 });
  };

  // Handle export
  const handleExport = () => {
    exportMutation.mutate(effectiveParams);
  };

  // Check for errors
  const hasError = logsError || statsError;

  // Mock stats data for when backend doesn't have AI usage yet
  const mockStats: AIUsageSummary = {
    totalCalls: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0,
    averageCostPerCall: 0,
    callsByFeature: {} as Record<AIFeature, number>,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Monitoring Navigation */}
      <MonitoringNav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI Usage Logs
          </h1>
          <p className="text-muted-foreground">
            Track AI API usage, costs, and frequency across features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchLogs()}
            disabled={logsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${logsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending || !logsData?.content?.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {logsError?.message ||
              statsError?.message ||
              "Failed to fetch AI usage data."}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Usage Summary</h3>
          <Select
            value={statsPeriod}
            onValueChange={(v) => setStatsPeriod(v as AIUsageStatsPeriod)}
          >
            <SelectTrigger className="w-[150px]">
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
        </div>

        <AIUsageStatsCard
          title={`AI Usage - ${
            PERIOD_OPTIONS.find((p) => p.value === statsPeriod)?.label
          }`}
          stats={statsData?.stats || mockStats}
          isLoading={statsLoading}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* Feature Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Feature</label>
              <Select
                value={selectedFeature}
                onValueChange={(v) => {
                  setSelectedFeature(v as AIFeature | "all");
                  setSearchParams((prev) => ({ ...prev, page: 0 }));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  {AI_FEATURES.map((feature) => (
                    <SelectItem key={feature.value} value={feature.value}>
                      {feature.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSearchParams((prev) => ({ ...prev, page: 0 }));
                }}
                className="w-[160px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSearchParams((prev) => ({ ...prev, page: 0 }));
                }}
                className="w-[160px]"
              />
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Logs</CardTitle>
          <CardDescription>
            Detailed log of all AI API calls with token counts and costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={logsData?.content || []}
            pagination={{
              pageIndex: logsData?.pageable?.pageNumber ?? 0,
              pageSize: logsData?.pageable?.pageSize ?? 10,
              totalPages: logsData?.totalPages ?? 0,
              totalElements: logsData?.totalElements ?? 0,
            }}
            onPaginationChange={handlePaginationChange}
            isLoading={logsLoading}
            emptyMessage="No AI usage logs found. Logs will appear here once AI features are used."
          />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About AI Usage Tracking</CardTitle>
          <CardDescription>
            This page provides insights into AI API usage across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Features Tracked:</strong> Magic Flashcard, Role Play,
            Grammar Sandbox, Pronunciation Feedback, and Content Generation.
          </p>
          <p>
            <strong>Token Counts:</strong> Input tokens are the tokens sent to
            the AI model, output tokens are the tokens received.
          </p>
          <p>
            <strong>Cost Calculation:</strong> Costs are calculated based on the
            AI provider's pricing model (per 1K tokens).
          </p>
          <p>
            <strong>Export:</strong> Use the Export CSV button to download logs
            for external analysis or reporting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
