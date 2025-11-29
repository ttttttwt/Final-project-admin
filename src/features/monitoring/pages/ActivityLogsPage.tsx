/**
 * ActivityLogsPage Component
 * Displays admin activity logs with filtering, pagination, and export
 * Access: ADMIN only
 */

import { useState } from "react";
import { format } from "date-fns";
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  History,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MonitoringNav from "../components/MonitoringNav";
import {
  useActivityLogs,
  useActivityStats,
  useActivityActions,
  useActivityUsers,
  useExportActivityLogs,
  useInvalidateMonitoring,
} from "../hooks/useMonitoring";
import type {
  AdminActivityLogsSearchParams,
  AdminActionType,
  AdminEntityType,
} from "../types";

// Action type display mapping
const ACTION_LABELS: Record<AdminActionType, string> = {
  COURSE_CREATED: "Course Created",
  COURSE_UPDATED: "Course Updated",
  COURSE_PUBLISHED: "Course Published",
  COURSE_UNPUBLISHED: "Course Unpublished",
  COURSE_DELETED: "Course Deleted",
  SECTION_CREATED: "Section Created",
  SECTION_UPDATED: "Section Updated",
  SECTION_DELETED: "Section Deleted",
  LESSON_CREATED: "Lesson Created",
  LESSON_UPDATED: "Lesson Updated",
  LESSON_DELETED: "Lesson Deleted",
};

// Action type badge variants
const getActionBadgeVariant = (
  action: AdminActionType
): "default" | "secondary" | "destructive" | "outline" => {
  if (action.includes("DELETED")) return "destructive";
  if (action.includes("CREATED")) return "default";
  if (action.includes("PUBLISHED")) return "secondary";
  return "outline";
};

// Entity type colors
const ENTITY_TYPE_COLORS: Record<AdminEntityType, string> = {
  COURSE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  SECTION: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  LESSON:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export default function ActivityLogsPage() {
  const [searchParams, setSearchParams] =
    useState<AdminActivityLogsSearchParams>({
      page: 0,
      size: 10,
      sortBy: "createdAt",
      sortDir: "desc",
    });
  const [searchInput, setSearchInput] = useState("");
  const [statsPeriod, setStatsPeriod] = useState("today");

  const {
    data: logsData,
    isLoading: logsLoading,
    refetch,
  } = useActivityLogs(searchParams);
  const { data: statsData, isLoading: statsLoading } =
    useActivityStats(statsPeriod);
  const { data: actions } = useActivityActions();
  const { data: users } = useActivityUsers();
  const exportMutation = useExportActivityLogs();
  const { invalidateActivityLogs } = useInvalidateMonitoring();

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 0,
    }));
  };

  const handleFilterChange = (
    key: keyof AdminActivityLogsSearchParams,
    value: string | undefined
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      page: 0,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleExport = () => {
    exportMutation.mutate(searchParams);
  };

  const handleRefresh = () => {
    invalidateActivityLogs();
    refetch();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Monitoring Navigation */}
      <MonitoringNav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            Activity Logs
          </h1>
          <p className="text-muted-foreground">
            Track admin and content manager activities in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
            <Select value={statsPeriod} onValueChange={setStatsPeriod}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {statsData?.stats.totalActivities ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Action</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-sm font-medium">
                {statsData?.stats.activitiesByAction
                  ? Object.entries(statsData.stats.activitiesByAction)
                      .sort(([, a], [, b]) => b - a)[0]?.[0]
                      ?.replace(/_/g, " ") ?? "N/A"
                  : "N/A"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Active User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-sm font-medium truncate">
                {statsData?.stats.topActiveUsers
                  ? Object.entries(statsData.stats.topActiveUsers)[0]?.[0] ??
                    "N/A"
                  : "N/A"}
              </div>
            )}
          </CardContent>
        </Card>
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
          <div className="grid gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="flex gap-2 md:col-span-2">
              <Input
                placeholder="Search in description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="secondary" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Type Filter */}
            <Select
              value={searchParams.action || "all"}
              onValueChange={(value) => handleFilterChange("action", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions?.map((action) => (
                  <SelectItem key={action} value={action}>
                    {ACTION_LABELS[action] || action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Entity Type Filter */}
            <Select
              value={searchParams.entityType || "all"}
              onValueChange={(value) => handleFilterChange("entityType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Entity Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entity Types</SelectItem>
                <SelectItem value="COURSE">Course</SelectItem>
                <SelectItem value="SECTION">Section</SelectItem>
                <SelectItem value="LESSON">Lesson</SelectItem>
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select
              value={searchParams.userName || "all"}
              onValueChange={(value) => handleFilterChange("userName", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity Name</TableHead>
                <TableHead className="max-w-md">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logsData?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No activity logs found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logsData?.content.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.userName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {ACTION_LABELS[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          ENTITY_TYPE_COLORS[log.entityType]
                        }`}
                      >
                        {log.entityType}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {log.entityName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {logsData && logsData.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {logsData.pageable.pageNumber + 1} of {logsData.totalPages}{" "}
                ({logsData.totalElements} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(logsData.pageable.pageNumber - 1)
                  }
                  disabled={logsData.first}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(logsData.pageable.pageNumber + 1)
                  }
                  disabled={logsData.last}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
