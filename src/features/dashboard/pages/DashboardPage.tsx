import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import StatsCard from "../components/StatsCard";
import RecentActivity from "../components/RecentActivity";
import OverviewChart from "../components/OverviewChart";
import { Users, BookOpen, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/courses/create">
              <BookOpen className="mr-2 h-4 w-4" />
              New Course
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Registered users"
        />
        <StatsCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          description="All courses"
        />
        <StatsCard
          title="Published Courses"
          value={stats?.publishedCourses || 0}
          icon={Globe}
          description="Available to learners"
        />
        <StatsCard
          title="Total Lessons"
          value={stats?.totalLessons || 0}
          icon={FileText}
          description="Content units"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OverviewChart coursesByLevel={stats?.coursesByLevel || {}} />
        <RecentActivity activities={stats?.recentActivities || []} />
      </div>
    </div>
  );
}
