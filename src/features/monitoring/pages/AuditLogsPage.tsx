/**
 * AuditLogsPage Component
 * Displays audit logs with filtering, pagination, JSON viewer, and export
 * Access: ADMIN only
 */

import { useState } from "react";
import { format } from "date-fns";
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  Shield,
  Eye,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import MonitoringNav from "../components/MonitoringNav";
import {
  useAuditLogs,
  useAuditActions,
  useAuditEntityTypes,
  useExportAuditLogs,
  useInvalidateMonitoring,
} from "../hooks/useMonitoring";
import type { AuditLogsSearchParams, AuditLog } from "../types";

// Action type badge colors
const getActionBadgeVariant = (
  action: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (action.includes("DELETE")) return "destructive";
  if (action.includes("CREATE") || action.includes("UPDATE")) return "default";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "secondary";
  return "outline";
};

// Format JSON for display
const formatJsonChanges = (changes: string | undefined): string => {
  if (!changes) return "No changes recorded";
  try {
    return JSON.stringify(JSON.parse(changes), null, 2);
  } catch {
    return changes;
  }
};

export default function AuditLogsPage() {
  const [searchParams, setSearchParams] = useState<AuditLogsSearchParams>({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const {
    data: logsData,
    isLoading: logsLoading,
    refetch,
  } = useAuditLogs(searchParams);
  const { data: actions } = useAuditActions();
  const { data: entityTypes } = useAuditEntityTypes();
  const exportMutation = useExportAuditLogs();
  const { invalidateAuditLogs } = useInvalidateMonitoring();

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 0,
    }));
  };

  const handleFilterChange = (
    key: keyof AuditLogsSearchParams,
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
    invalidateAuditLogs();
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
            <FileText className="h-8 w-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">
            Track user profile changes and security events for compliance
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {logsData?.totalElements ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions?.length ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entityTypes?.length ?? 0}</div>
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
                placeholder="Search in changes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="secondary" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Filter */}
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
                    {action.replace(/_/g, " ")}
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
                {entityTypes?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Email Filter */}
            <Input
              placeholder="Filter by email..."
              value={searchParams.userEmail || ""}
              onChange={(e) =>
                handleFilterChange("userEmail", e.target.value || undefined)
              }
            />
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
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Details</TableHead>
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
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logsData?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No audit logs found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logsData?.content.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {log.userName || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.userEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.entityType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {log.ipAddress || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
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

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              {selectedLog && (
                <span>
                  {format(
                    new Date(selectedLog.createdAt),
                    "MMMM d, yyyy 'at' HH:mm:ss"
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Summary Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">User</div>
                  <div>{selectedLog.userName || "Unknown"}</div>
                  <div className="text-muted-foreground">
                    {selectedLog.userEmail}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">
                    Action
                  </div>
                  <Badge variant={getActionBadgeVariant(selectedLog.action)}>
                    {selectedLog.action.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">
                    Entity Type
                  </div>
                  <div>{selectedLog.entityType}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">
                    Entity ID
                  </div>
                  <div className="font-mono text-xs break-all">
                    {selectedLog.entityId}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">
                    IP Address
                  </div>
                  <div className="font-mono">
                    {selectedLog.ipAddress || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">
                    User Agent
                  </div>
                  <div
                    className="text-xs truncate"
                    title={selectedLog.userAgent}
                  >
                    {selectedLog.userAgent || "N/A"}
                  </div>
                </div>
              </div>

              {/* Changes JSON */}
              <div>
                <div className="font-medium text-muted-foreground mb-2">
                  Changes
                </div>
                <div className="h-[200px] rounded-md border bg-muted/50 p-4 overflow-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {formatJsonChanges(selectedLog.changes)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
