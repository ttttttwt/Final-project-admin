import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
    };
}

export default function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground">
                        {trend && (
                            <span className={trend.value > 0 ? "text-green-500" : "text-red-500"}>
                                {trend.value > 0 ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        {" "}
                        {description || trend?.label}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
