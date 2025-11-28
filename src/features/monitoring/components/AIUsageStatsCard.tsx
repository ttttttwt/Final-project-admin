/**
 * AIUsageStatsCard Component
 * Displays AI usage summary statistics
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Zap, Hash, TrendingUp, Bot } from "lucide-react";
import type { AIUsageSummary } from "../types";

interface AIUsageStatsCardProps {
  title: string;
  stats: AIUsageSummary | null;
  isLoading?: boolean;
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

/**
 * Format large numbers with abbreviations
 */
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function AIUsageStatsCard({
  title,
  stats,
  isLoading,
}: AIUsageStatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Total Calls
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(stats.totalCalls)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Total Tokens
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(stats.totalInputTokens + stats.totalOutputTokens)}
            </p>
            <p className="text-xs text-muted-foreground">
              In: {formatNumber(stats.totalInputTokens)} | Out:{" "}
              {formatNumber(stats.totalOutputTokens)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Total Cost
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.totalCost)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Avg Cost/Call
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.averageCostPerCall)}
            </p>
          </div>
        </div>

        {/* Feature breakdown */}
        {stats.callsByFeature &&
          Object.keys(stats.callsByFeature).length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm font-medium mb-3">Calls by Feature</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(stats.callsByFeature).map(
                  ([feature, count]) => (
                    <div
                      key={feature}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span className="text-xs truncate">
                        {feature.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-medium ml-2">
                        {formatNumber(count)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

export default AIUsageStatsCard;
