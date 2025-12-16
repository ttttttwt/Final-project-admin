/**
 * CostTrendChart Component
 * Displays daily cost trends over time
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DailyCostData } from "../types";

interface CostTrendChartProps {
  data: DailyCostData[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

/**
 * Format currency for Y axis
 */
function formatCurrency(value: number): string {
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toFixed(4)}`;
}

/**
 * Format date for X axis
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Custom tooltip component
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">
              {entry.dataKey.replace("Cost", "")}:
            </span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton
 */
function ChartSkeleton() {
  return (
    <div className="flex items-end justify-between h-[300px] gap-2 p-4">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-muted animate-pulse rounded-t"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  );
}

export function CostTrendChart({
  data,
  isLoading,
  title = "Cost Trend",
  description = "Daily AI costs over time",
}: CostTrendChartProps) {
  // Transform data for display
  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p>No trend data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="rolePlayCost"
                  name="Role-Play"
                  stackId="1"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="grammarCost"
                  name="Grammar"
                  stackId="1"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="flashcardCost"
                  name="Flashcard"
                  stackId="1"
                  stroke="#dc2626"
                  fill="#dc2626"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CostTrendChart;
