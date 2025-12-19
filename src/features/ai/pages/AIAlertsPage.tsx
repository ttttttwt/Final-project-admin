import { useState, useMemo } from "react";
import { AlertTriangle, Check, CheckCircle, Eye, RefreshCw, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AINav, PlanBadge } from "../components";
import {
  useAIAlerts,
  useMarkAlertRead,
  useAcknowledgeAlert,
  useMarkAllAlertsRead,
} from "../hooks/useAI";
import type { AIUsageAlert } from "../types";

// Alert types
const ALERT_TYPES = [
  "BUDGET_WARNING",
  "BUDGET_EXCEEDED",
  "QUOTA_WARNING",
  "QUOTA_EXCEEDED",
  "ERROR_SPIKE",
  "API_ERROR",
] as const;

const SEVERITIES = ["INFO", "WARNING", "ERROR", "CRITICAL"] as const;

function getSeverityVariant(
  severity: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (severity) {
    case "CRITICAL":
    case "ERROR":
      return "destructive";
    case "WARNING":
      return "secondary";
    default:
      return "outline";
  }
}

function formatAlertType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AIAlertsPage() {
  // Filter state
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const {
    data: alertsData,
    isLoading,
    error,
    refetch,
  } = useAIAlerts({ unreadOnly });

  const markReadMutation = useMarkAlertRead();
  const acknowledgeMutation = useAcknowledgeAlert();
  const markAllReadMutation = useMarkAllAlertsRead();

  // Filter alerts locally
  const filteredAlerts = useMemo(() => {
    if (!alertsData?.content) return [];

    return alertsData.content.filter((alert: AIUsageAlert) => {
      if (severityFilter !== "ALL" && alert.severity !== severityFilter) {
        return false;
      }
      if (typeFilter !== "ALL" && alert.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [alertsData?.content, severityFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const content = alertsData?.content ?? [];
    return {
      total: content.length,
      critical: content.filter((a: AIUsageAlert) => a.severity === "CRITICAL").length,
      warning: content.filter((a: AIUsageAlert) => a.severity === "WARNING").length,
      unread: alertsData?.unreadCount ?? 0,
    };
  }, [alertsData]);

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const clearFilters = () => {
    setSeverityFilter("ALL");
    setTypeFilter("ALL");
    setUnreadOnly(false);
  };

  const hasActiveFilters = severityFilter !== "ALL" || typeFilter !== "ALL" || unreadOnly;

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <AINav />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading alerts</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load alerts"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AINav />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI usage alerts and warnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAllRead()}
            disabled={markAllReadMutation.isPending || stats.unread === 0}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Alerts</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical</CardDescription>
            <CardTitle className="text-2xl text-destructive">{stats.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Warnings</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.warning}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unread</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.unread}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                {filteredAlerts.length} of {stats.total} alerts shown
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Severity Filter */}
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Severity</SelectItem>
                  {SEVERITIES.map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      {sev}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {ALERT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatAlertType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Unread Toggle */}
              <Button
                variant={unreadOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setUnreadOnly(!unreadOnly)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Unread Only
              </Button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading alerts...
                  </TableCell>
                </TableRow>
              ) : filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {hasActiveFilters ? "No alerts match the current filters" : "No alerts found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert: AIUsageAlert) => (
                  <TableRow key={alert.id} className={!alert.isRead ? "bg-muted/30" : ""}>
                    <TableCell>
                      <Badge variant={getSeverityVariant(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatAlertType(alert.type)}</span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate" title={alert.message}>
                        {alert.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      {alert.details?.userFullName ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{String(alert.details.userFullName)}</span>
                          {typeof alert.details?.planType === 'string' && (
                            <PlanBadge planType={alert.details.planType} size="sm" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {alert.isRead ? (
                        <Badge variant="outline">Read</Badge>
                      ) : (
                        <Badge>Unread</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkRead(alert.id)}
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {!alert.acknowledgedAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAcknowledge(alert.id)}
                            title="Acknowledge"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIAlertsPage;
