/**
 * CostByPlanCard Component
 * Displays cost breakdown by subscription plan (Free vs Pro)
 */

import { Crown, User } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface CostByPlanData {
    freeCost: number;
    proCost: number;
    freeUsers: number;
    proUsers: number;
    freeRequests: number;
    proRequests: number;
}

interface CostByPlanCardProps {
    data?: CostByPlanData;
    isLoading?: boolean;
}

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

export function CostByPlanCard({ data, isLoading }: CostByPlanCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalCost = (data?.freeCost ?? 0) + (data?.proCost ?? 0);
    const freePercentage = totalCost > 0 ? ((data?.freeCost ?? 0) / totalCost) * 100 : 0;
    const proPercentage = totalCost > 0 ? ((data?.proCost ?? 0) / totalCost) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cost by Plan</CardTitle>
                <CardDescription>
                    Cost distribution between Free and Pro users
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Free Plan */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Free Users</span>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">{formatCurrency(data?.freeCost ?? 0)}</p>
                            <p className="text-xs text-muted-foreground">
                                {data?.freeUsers ?? 0} users • {data?.freeRequests ?? 0} requests
                            </p>
                        </div>
                    </div>
                    <Progress value={freePercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                        {freePercentage.toFixed(1)}% of total cost
                    </p>
                </div>

                {/* Pro Plan */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-amber-500" />
                            <span className="font-medium text-amber-600">Pro Users</span>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-amber-600">{formatCurrency(data?.proCost ?? 0)}</p>
                            <p className="text-xs text-muted-foreground">
                                {data?.proUsers ?? 0} users • {data?.proRequests ?? 0} requests
                            </p>
                        </div>
                    </div>
                    <Progress
                        value={proPercentage}
                        className="h-2 [&>div]:bg-amber-500"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {proPercentage.toFixed(1)}% of total cost
                    </p>
                </div>

                {/* Summary */}
                <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-bold">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Total Users</span>
                        <span className="font-medium">
                            {(data?.freeUsers ?? 0) + (data?.proUsers ?? 0)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default CostByPlanCard;
