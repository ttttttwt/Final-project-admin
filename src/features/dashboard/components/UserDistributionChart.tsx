import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { UserDistribution } from "../types/analytics.types";

interface UserDistributionChartProps {
  data: UserDistribution;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function UserDistributionChart({ data }: UserDistributionChartProps) {
  const chartData = [
    { name: "Free Users", value: data.freeUsers },
    { name: "Monthly Pro", value: data.monthlyProUsers },
    { name: "Yearly Pro", value: data.yearlyProUsers },
  ].filter((d) => d.value > 0);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>User Distribution</CardTitle>
        <CardDescription>Subscription types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
