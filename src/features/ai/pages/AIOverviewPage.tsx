/**
 * AIOverviewPage Component
 * Dashboard overview for AI management
 */

import { Bot, DollarSign, Users, AlertTriangle, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AINav, PlanBadge } from "../components";
import { useAIOverview, useAIAlerts } from "../hooks/useAI";

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
 * Get severity badge variant
 */
function getSeverityVariant(
  severity: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (severity) {
    case "CRITICAL":
    case "ERROR":
      return "destructive";
    case "WARNING":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Loading skeleton
 */
function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AIOverviewPage() {
  const { data: overview, isLoading: overviewLoading, error } = useAIOverview();
  const { data: alertsData } = useAIAlerts({ limit: 5 });

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <AINav />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading overview</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load AI overview"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation */}
      <AINav />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8" />
          AI Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage AI features, quotas, and costs
        </p>
      </div>

      {overviewLoading ? (
        <OverviewSkeleton />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>Requests Today</CardDescription>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(overview?.totalRequestsToday ?? 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>Cost Today</CardDescription>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(overview?.totalCostToday ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>Active Users Today</CardDescription>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {overview?.activeUsersToday ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>Unread Alerts</CardDescription>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {alertsData?.unreadCount ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-muted/50 transition-colors">
              <Link to="/ai/quotas">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Quota Management
                  </CardTitle>
                  <CardDescription>
                    Manage monthly AI usage limits for Free and Pro users
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="hover:bg-muted/50 transition-colors">
              <Link to="/ai/costs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cost Analytics
                  </CardTitle>
                  <CardDescription>
                    View cost breakdown and budget status
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="hover:bg-muted/50 transition-colors">
              <Link to="/monitoring/ai-usage">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Usage Logs
                  </CardTitle>
                  <CardDescription>
                    View detailed AI usage logs
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Top Users and Alerts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle>Top AI Users Today</CardTitle>
                <CardDescription>
                  Users with highest AI usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overview?.topUsers?.length ? (
                  <div className="space-y-4">
                    {overview.topUsers.slice(0, 5).map((user, index) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-4">
                            {index + 1}.
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.userFullName}</p>
                              {user.planType && <PlanBadge planType={user.planType} size="sm" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {user.userEmail}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {user.totalRequests} requests
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(user.totalCost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No usage data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>
                    Latest AI usage alerts
                  </CardDescription>
                </div>
                {alertsData?.unreadCount ? (
                  <Link to="/ai/alerts">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                ) : null}
              </CardHeader>
              <CardContent>
                {alertsData?.content?.length ? (
                  <div className="space-y-3">
                    {alertsData.content.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Badge variant={getSeverityVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No alerts
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default AIOverviewPage;
