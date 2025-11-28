/**
 * SystemHealthPage Component
 * Displays system health status and metrics with auto-refresh capability
 *
 * ADMIN only page that shows:
 * - Health status cards (API, Database, Disk Space)
 * - System metrics (JVM memory, CPU usage, threads, uptime)
 * - Manual refresh button and auto-refresh toggle
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  RefreshCw,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useHealth, useSystemMetrics } from "../hooks/useMonitoring";
import { HealthStatusCard, MetricsCard, MonitoringNav } from "../components";
import type { HealthStatus } from "../types";

const AUTO_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

/**
 * Get overall status color and icon
 */
function getOverallStatusConfig(status: HealthStatus) {
  switch (status) {
    case "UP":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        icon: CheckCircle2,
        label: "All Systems Operational",
      };
    case "DOWN":
      return {
        color: "bg-red-500",
        textColor: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        icon: AlertTriangle,
        label: "System Issues Detected",
      };
    case "OUT_OF_SERVICE":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
        icon: AlertTriangle,
        label: "Partial Outage",
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-950/20",
        icon: Activity,
        label: "Status Unknown",
      };
  }
}

export default function SystemHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Query hooks with conditional auto-refresh
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useHealth({
    refetchInterval: autoRefresh ? AUTO_REFRESH_INTERVAL : undefined,
  });

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useSystemMetrics({
    refetchInterval: autoRefresh ? AUTO_REFRESH_INTERVAL : undefined,
  });

  // Update last refresh time when data changes
  useEffect(() => {
    if (healthData || metricsData) {
      setLastRefresh(new Date());
    }
  }, [healthData, metricsData]);

  // Manual refresh handler
  const handleRefresh = async () => {
    await Promise.all([refetchHealth(), refetchMetrics()]);
    setLastRefresh(new Date());
  };

  // Get overall status
  const overallStatus = healthData?.status ?? "UNKNOWN";
  const statusConfig = getOverallStatusConfig(overallStatus);
  const StatusIcon = statusConfig.icon;

  // Check for errors
  const hasError = healthError || metricsError;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Monitoring Navigation */}
      <MonitoringNav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system status and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <label
              htmlFor="auto-refresh"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Auto-refresh (30s)
            </label>
          </div>

          {/* Manual refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={healthLoading || metricsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                healthLoading || metricsLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last refresh time */}
      <p className="text-xs text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </p>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error fetching health data</AlertTitle>
          <AlertDescription>
            {healthError?.message ||
              metricsError?.message ||
              "Failed to fetch system health data. Please check if the backend is running."}
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Status Banner */}
      <Card className={`${statusConfig.bgColor} border-2`}>
        <CardContent className="flex items-center gap-4 py-4">
          <div className={`p-3 rounded-full ${statusConfig.color}`}>
            <StatusIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{statusConfig.label}</h2>
            <p className="text-sm text-muted-foreground">
              Overall system status:{" "}
              <Badge
                variant={overallStatus === "UP" ? "default" : "destructive"}
              >
                {overallStatus}
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Health Status Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="h-5 w-5" />
          Component Health
        </h3>
        {healthLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* API Health */}
            <HealthStatusCard
              name="API Server"
              status={healthData?.status ?? "UNKNOWN"}
              icon="server"
              details={{
                ping: healthData?.components?.ping?.status ?? "UNKNOWN",
              }}
            />

            {/* Database Health */}
            <HealthStatusCard
              name="Database"
              status={healthData?.components?.db?.status ?? "UNKNOWN"}
              icon="database"
              details={healthData?.components?.db?.details}
            />

            {/* Disk Space Health */}
            <HealthStatusCard
              name="Disk Space"
              status={healthData?.components?.diskSpace?.status ?? "UNKNOWN"}
              icon="disk"
              details={healthData?.components?.diskSpace?.details}
            />
          </div>
        )}
      </div>

      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Metrics
        </h3>
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : metricsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* JVM Memory Used */}
            <MetricsCard
              title="JVM Memory Used"
              value={metricsData.jvmMemoryUsed}
              maxValue={metricsData.jvmMemoryMax}
              unit="bytes"
              icon="memory"
              showProgress
            />

            {/* System CPU Usage */}
            <MetricsCard
              title="System CPU Usage"
              value={metricsData.systemCpuUsage}
              unit="percent"
              icon="cpu"
            />

            {/* Process CPU Usage */}
            <MetricsCard
              title="Process CPU Usage"
              value={metricsData.processCpuUsage}
              unit="percent"
              icon="cpu"
            />

            {/* Live Threads */}
            <MetricsCard
              title="Live Threads"
              value={metricsData.jvmThreadsLive}
              icon="activity"
              formatValue={(v) => v.toString()}
            />

            {/* Peak Threads */}
            <MetricsCard
              title="Peak Threads"
              value={metricsData.jvmThreadsPeak}
              icon="activity"
              formatValue={(v) => v.toString()}
            />

            {/* Uptime */}
            <MetricsCard
              title="Uptime"
              value={metricsData.jvmUptimeSeconds}
              unit="seconds"
              icon="clock"
            />

            {/* HTTP Requests */}
            <MetricsCard
              title="HTTP Requests (Total)"
              value={metricsData.httpRequestsTotal}
              icon="server"
              formatValue={(v) => v.toLocaleString()}
            />

            {/* Memory Committed */}
            <MetricsCard
              title="Memory Committed"
              value={metricsData.jvmMemoryCommitted}
              unit="bytes"
              icon="memory"
            />
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No metrics data available
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Health Monitoring</CardTitle>
          <CardDescription>
            This page displays real-time health status and metrics from Spring
            Boot Actuator endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Health Status:</strong> Shows the overall health of the
            application and its components (database, disk space).
          </p>
          <p>
            <strong>System Metrics:</strong> Displays JVM memory usage, CPU
            utilization, thread counts, and application uptime.
          </p>
          <p>
            <strong>Auto-refresh:</strong> When enabled, data will automatically
            refresh every 30 seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
