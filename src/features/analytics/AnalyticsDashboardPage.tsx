/**
 * AnalyticsDashboardPage Component
 * Admin analytics dashboard with charts and statistics
 */

import {
    BarChart3,
    Users,
    DollarSign,
    Activity,
    TrendingUp,
    RefreshCw,
    Zap,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalytics } from './hooks';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';

// Chart colors - using CEFR level codes
const LEVEL_COLORS: Record<string, string> = {
    A1: '#22c55e',  // Beginner
    A2: '#84cc16',  // Elementary
    B1: '#eab308',  // Intermediate
    B2: '#f97316',  // Upper Intermediate
    C1: '#ef4444',  // Advanced
};

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(value);
}

// Format number
function formatNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
}

// Stats Card
function StatsCard({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down';
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subValue && (
                    <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {trend && (trend === 'up' ? '↑ ' : '↓ ')}
                        {subValue}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function AnalyticsDashboardPage() {
    const { data, isLoading, refetch } = useAnalytics();

    // Prepare chart data
    const monthlyChartData = data?.monthlyStats.map((item) => ({
        month: item.month.slice(5), // "01", "02", etc.
        users: item.newUsers,
        revenue: item.revenue,
        aiRequests: item.aiRequests,
    })) || [];

    const userDistributionData = data?.userDistribution
        ? [
            { name: 'Free', value: data.userDistribution.freeUsers, color: '#94a3b8' },
            { name: 'Monthly', value: data.userDistribution.monthlyProUsers, color: '#3b82f6' },
            { name: 'Yearly', value: data.userDistribution.yearlyProUsers, color: '#10b981' },
        ]
        : [];

    const levelData = data?.userDistribution?.usersByLevel
        ? Object.entries(data.userDistribution.usersByLevel).map(([level, count]) => ({
            name: level.replace('_', ' '),
            value: count,
            color: LEVEL_COLORS[level] || '#6b7280',
        }))
        : [];

    const aiUsageData = data?.aiUsage
        ? [
            { name: 'Role Play', value: data.aiUsage.roleplayRequests },
            { name: 'Grammar', value: data.aiUsage.grammarRequests },
            { name: 'Flashcard', value: data.aiUsage.flashcardRequests },
            { name: 'Custom Material', value: data.aiUsage.customMaterialRequests },
        ]
        : [];

    const dailyAIData = data?.aiUsage?.dailyUsage.map((item) => ({
        date: item.date.slice(5), // "01-15" format
        requests: item.requests,
        tokens: item.tokensUsed / 1000, // Convert to K
    })) || [];

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="h-8 w-8" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Thống kê tổng quan hệ thống
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            {/* Overview Stats */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px]" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Tổng người dùng"
                        value={formatNumber(data?.overview.totalUsers || 0)}
                        subValue={`+${data?.overview.newUsersThisMonth || 0} tháng này`}
                        icon={Users}
                        trend="up"
                    />
                    <StatsCard
                        title="Người dùng Pro"
                        value={formatNumber(data?.overview.proUsers || 0)}
                        subValue={`${data?.overview.freeUsers || 0} free users`}
                        icon={TrendingUp}
                    />
                    <StatsCard
                        title="Doanh thu tháng"
                        value={formatCurrency(data?.overview.revenueThisMonth || 0)}
                        subValue={`Tổng: ${formatCurrency(data?.overview.totalRevenue || 0)}`}
                        icon={DollarSign}
                        trend="up"
                    />
                    <StatsCard
                        title="AI Requests tháng"
                        value={formatNumber(data?.overview.aiRequestsThisMonth || 0)}
                        subValue={`Tổng: ${formatNumber(data?.overview.totalAIRequests || 0)}`}
                        icon={Zap}
                    />
                </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Monthly Stats Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê theo tháng</CardTitle>
                        <CardDescription>Users mới và AI requests 6 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[300px]" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="New Users" />
                                    <Bar yAxisId="right" dataKey="aiRequests" fill="#10b981" name="AI Requests" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* User Distribution Pie */}
                <Card>
                    <CardHeader>
                        <CardTitle>Phân bố người dùng</CardTitle>
                        <CardDescription>Free vs Pro users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[300px]" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={userDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {userDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* AI Usage Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            AI Usage Breakdown
                        </CardTitle>
                        <CardDescription>
                            {data?.aiUsage && `Success rate: ${data.aiUsage.successRate}% | Avg response: ${data.aiUsage.averageResponseTimeMs}ms`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[300px]" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={aiUsageData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6" name="Requests" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Daily AI Usage Line */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI Usage Trend (14 ngày)</CardTitle>
                        <CardDescription>Requests và tokens theo ngày</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[300px]" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyAIData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#3b82f6" name="Requests" />
                                    <Line yAxisId="right" type="monotone" dataKey="tokens" stroke="#f59e0b" name="Tokens (K)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* User Levels */}
            <Card>
                <CardHeader>
                    <CardTitle>Phân bố trình độ CEFR</CardTitle>
                    <CardDescription>Số người dùng theo từng cấp độ</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[200px]" />
                    ) : levelData.length === 0 || levelData.every(d => d.value === 0) ? (
                        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm">Chưa có dữ liệu trình độ CEFR</p>
                                <p className="text-xs mt-1">
                                    Người dùng cần hoàn thành bài kiểm tra đánh giá để xác định trình độ
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={levelData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" name="Users">
                                    {levelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AnalyticsDashboardPage;
