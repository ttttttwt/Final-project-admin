import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { MonthlyStats } from "../types/analytics.types";

interface TotalRevenueChartProps {
    data: MonthlyStats[];
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(value);
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
    payload?: Array<{ value: number; name: string }>;
    label?: string;
}) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-3 shadow-sm">
                <p className="font-medium mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm text-emerald-500">
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

export default function TotalRevenueChart({ data }: TotalRevenueChartProps) {
    const hasData = data && data.length > 0 && data.some((d) => d.revenue > 0);

    // Calculate total revenue
    const totalRevenue = data?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Total Revenue</span>
                    <span className="text-2xl text-emerald-500">
                        {formatCurrency(totalRevenue)}
                    </span>
                </CardTitle>
                <CardDescription>Monthly revenue trend (last 6 months)</CardDescription>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <p className="text-sm">No revenue data available yet.</p>
                            <p className="text-xs mt-1">
                                Revenue will appear here once payments are processed.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="month"
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
                                tickFormatter={(value) => `$${value}`}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
