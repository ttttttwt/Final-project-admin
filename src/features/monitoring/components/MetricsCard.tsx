/**
 * MetricsCard Component
 * Displays system metrics with visual indicators
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, MemoryStick, Clock, Activity, Gauge, Server } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: number;
  maxValue?: number;
  unit?: string;
  icon?: "cpu" | "memory" | "clock" | "activity" | "gauge" | "server";
  showProgress?: boolean;
  formatValue?: (value: number) => string;
}

const iconMap = {
  cpu: Cpu,
  memory: MemoryStick,
  clock: Clock,
  activity: Activity,
  gauge: Gauge,
  server: Server,
};

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format seconds to human readable duration
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}

/**
 * Format percentage
 */
function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function MetricsCard({
  title,
  value,
  maxValue,
  unit,
  icon = "gauge",
  showProgress = false,
  formatValue,
}: MetricsCardProps) {
  const Icon = iconMap[icon];

  // Calculate progress percentage
  const progressValue =
    maxValue && maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  // Format the displayed value
  const displayValue = formatValue
    ? formatValue(value)
    : unit === "bytes"
    ? formatBytes(value)
    : unit === "seconds"
    ? formatDuration(value)
    : unit === "percent"
    ? formatPercentage(value)
    : value.toLocaleString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {showProgress && maxValue && (
          <div className="mt-3 space-y-1">
            <Progress
              value={progressValue}
              className="h-2"
              // Apply color via CSS variable or wrapper
            />
            <p className="text-xs text-muted-foreground">
              {formatBytes(value)} / {formatBytes(maxValue)} (
              {progressValue.toFixed(1)}%)
            </p>
          </div>
        )}
        {unit &&
          !showProgress &&
          unit !== "bytes" &&
          unit !== "seconds" &&
          unit !== "percent" && (
            <p className="text-xs text-muted-foreground mt-1">{unit}</p>
          )}
      </CardContent>
    </Card>
  );
}

export default MetricsCard;
