/**
 * CostBreakdownChart Component
 * Visualizes AI cost breakdown by feature using recharts
 */

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeatureCostBreakdown } from "../types";

interface CostBreakdownChartProps {
  data: FeatureCostBreakdown[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

/**
 * Color palette for features
 */
const FALLBACK_COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#dc2626", // red
  "#ca8a04", // yellow
  "#9333ea", // purple
];

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

/**
 * Format feature name for display
 */
function formatFeatureName(name: string): string {
  return name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Custom tooltip component
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      totalCost: number;
      totalRequests: number;
      percentage: number;
    };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.name}</p>
      <div className="mt-2 space-y-1 text-sm">
        <p className="text-muted-foreground">
          Cost: <span className="font-medium text-foreground">{formatCurrency(data.totalCost)}</span>
        </p>
        <p className="text-muted-foreground">
          Requests: <span className="font-medium text-foreground">{data.totalRequests.toLocaleString()}</span>
        </p>
        <p className="text-muted-foreground">
          Share: <span className="font-medium text-foreground">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Loading skeleton
 */
function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <div className="animate-pulse rounded-full bg-muted h-48 w-48" />
    </div>
  );
}

export function CostBreakdownChart({
  data,
  isLoading,
  title = "Cost by Feature",
  description = "Breakdown of AI costs by feature type",
}: CostBreakdownChartProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    name: formatFeatureName(item.featureName),
    value: item.totalCost,
    totalCost: item.totalCost,
    totalRequests: item.totalRequests,
    percentage: item.percentage,
  }));

  // Calculate total cost
  const totalCost = data.reduce((sum, item) => sum + item.totalCost, 0);

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
            <p>No cost data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, payload }) => {
                    const pct = (payload as { percentage?: number })?.percentage ?? 0;
                    return pct > 5 ? `${name} (${pct.toFixed(0)}%)` : "";
                  }}
                  labelLine={false}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Total cost summary */}
        {!isLoading && data.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CostBreakdownChart;
