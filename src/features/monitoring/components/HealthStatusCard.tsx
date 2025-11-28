/**
 * HealthStatusCard Component
 * Displays individual health component status with icon and details
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  HardDrive,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { HealthStatus } from "../types";

interface HealthStatusCardProps {
  name: string;
  status: HealthStatus;
  icon?: "database" | "disk" | "server" | "ping";
  details?: Record<string, unknown>;
}

const statusConfig = {
  UP: {
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  DOWN: {
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  OUT_OF_SERVICE: {
    variant: "secondary" as const,
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  UNKNOWN: {
    variant: "outline" as const,
    icon: HelpCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
};

const iconMap = {
  database: Database,
  disk: HardDrive,
  server: Server,
  ping: Activity,
};

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format detail value for display
 */
function formatDetailValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "N/A";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") {
    // Check if it's a byte value
    if (
      key.toLowerCase().includes("space") ||
      key.toLowerCase().includes("total") ||
      key.toLowerCase().includes("free")
    ) {
      return formatBytes(value);
    }
    return value.toLocaleString();
  }

  return String(value);
}

export function HealthStatusCard({
  name,
  status,
  icon,
  details,
}: HealthStatusCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const ComponentIcon = icon ? iconMap[icon] : Server;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ComponentIcon className="h-4 w-4" />
          {name}
        </CardTitle>
        <Badge variant={config.variant} className="flex items-center gap-1">
          <StatusIcon className={`h-3 w-3 ${config.color}`} />
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        {details && Object.keys(details).length > 0 ? (
          <div className="space-y-1 text-sm text-muted-foreground">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="font-medium">
                  {formatDetailValue(key, value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            System component is operational
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default HealthStatusCard;
