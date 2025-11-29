import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "../types/dashboard.types";

interface OverviewChartProps {
  coursesByLevel: Record<string, number>;
}

/**
 * Transform API data to chart data format
 */
function transformToChartData(
  coursesByLevel: Record<string, number>
): ChartDataPoint[] {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.map((level) => ({
    level,
    courses: coursesByLevel[level] || 0,
  }));
}

/**
 * Custom tooltip component for the chart
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="font-medium mb-2">CEFR Level: {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-blue-500">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function OverviewChart({ coursesByLevel }: OverviewChartProps) {
  const chartData = transformToChartData(coursesByLevel);
  const hasData = chartData.some((d) => d.courses > 0);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Courses by CEFR level</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No data available yet.</p>
              <p className="text-xs mt-1">
                Create courses to see the overview chart.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="level"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="courses"
                name="Courses"
                fill="hsl(217, 91%, 60%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
