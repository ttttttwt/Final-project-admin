/**
 * UserMonitoringPage Component
 * Admin page for real-time user monitoring with session tracking and activity alerts
 */

import { useState } from 'react';
import {
    Users,
    Monitor,
    Smartphone,
    Tablet,
    RefreshCw,
    AlertTriangle,
    Activity,
    Eye,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useActiveUsers,
    useAlerts,
    useUserSessions,
    useUserActivity,
} from '../hooks/useUserMonitoring';
import type {
    AbnormalActivityAlertDTO,
    AlertSeverity,
} from '../types/userMonitoringTypes';

// Helper to format date/time
function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

// Helper to format time ago
function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
}

// Severity badge colors
function getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
        case 'CRITICAL':
            return 'bg-red-600 text-white';
        case 'HIGH':
            return 'bg-orange-500 text-white';
        case 'MEDIUM':
            return 'bg-yellow-500 text-black';
        case 'LOW':
            return 'bg-blue-500 text-white';
        default:
            return 'bg-gray-500';
    }
}

// Device icon component
function DeviceIcon({ type }: { type: string }) {
    switch (type) {
        case 'DESKTOP':
            return <Monitor className="h-4 w-4" />;
        case 'MOBILE':
            return <Smartphone className="h-4 w-4" />;
        case 'TABLET':
            return <Tablet className="h-4 w-4" />;
        default:
            return <Monitor className="h-4 w-4" />;
    }
}

// Stats Card Component
function StatsCard({
    title,
    value,
    icon: Icon,
    description,
}: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

// Alert Card Component
function AlertCard({ alert }: { alert: AbnormalActivityAlertDTO }) {
    return (
        <Alert variant={alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
                <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                </Badge>
                {alert.description}
            </AlertTitle>
            <AlertDescription className="mt-2">
                <p><strong>User:</strong> {alert.userEmail}</p>
                <p><strong>Chi tiết:</strong> {alert.details}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Phát hiện: {formatTimeAgo(alert.detectedAt)}
                </p>
            </AlertDescription>
        </Alert>
    );
}

// User Detail Dialog Component
function UserDetailDialog({
    userId,
    userEmail,
    open,
    onOpenChange,
}: {
    userId: string;
    userEmail: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data: sessions, isLoading: sessionsLoading } = useUserSessions(userId);
    const { data: activity, isLoading: activityLoading } = useUserActivity(userId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết User: {userEmail}</DialogTitle>
                    <DialogDescription>
                        Lịch sử đăng nhập và hoạt động AI
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Sessions */}
                    <div>
                        <h3 className="font-semibold mb-2">Lịch sử đăng nhập</h3>
                        {sessionsLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead>Thiết bị</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions?.content.slice(0, 5).map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>{formatDateTime(session.loginTime)}</TableCell>
                                            <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <DeviceIcon type={session.deviceType} />
                                                    {session.deviceType}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={session.isActive ? 'default' : 'secondary'}>
                                                    {session.isActive ? 'Đang hoạt động' : 'Đã đăng xuất'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Activity */}
                    <div>
                        <h3 className="font-semibold mb-2">Hoạt động AI</h3>
                        {activityLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : (
                            <>
                                {/* Summary */}
                                {activity?.summary && (
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="p-3 border rounded-lg text-center">
                                            <p className="text-2xl font-bold">{activity.summary.roleplayRequests}</p>
                                            <p className="text-xs text-muted-foreground">Role Play</p>
                                        </div>
                                        <div className="p-3 border rounded-lg text-center">
                                            <p className="text-2xl font-bold">{activity.summary.grammarRequests}</p>
                                            <p className="text-xs text-muted-foreground">Grammar</p>
                                        </div>
                                        <div className="p-3 border rounded-lg text-center">
                                            <p className="text-2xl font-bold">{activity.summary.flashcardRequests}</p>
                                            <p className="text-xs text-muted-foreground">Flashcard</p>
                                        </div>
                                    </div>
                                )}

                                {/* Recent activities */}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Thời gian</TableHead>
                                            <TableHead>Loại</TableHead>
                                            <TableHead>Tokens</TableHead>
                                            <TableHead>Kết quả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activity?.activities.slice(0, 10).map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{formatTimeAgo(item.timestamp)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.contentType}</Badge>
                                                </TableCell>
                                                <TableCell>{item.tokensUsed.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.success ? 'default' : 'destructive'}>
                                                        {item.success ? 'Thành công' : 'Lỗi'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function UserMonitoringPage() {
    const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);

    const { data: activeUsers, isLoading, refetch } = useActiveUsers();
    const { data: alerts } = useAlerts();

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        User Monitoring
                    </h1>
                    <p className="text-muted-foreground">
                        Giám sát người dùng đang hoạt động và phát hiện bất thường
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            {/* Alerts Section */}
            {alerts && alerts.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Cảnh báo hoạt động bất thường ({alerts.length})
                    </h2>
                    {alerts.map((alert) => (
                        <AlertCard key={alert.alertId} alert={alert} />
                    ))}
                </div>
            )}

            {/* Stats Cards */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px] rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-4">
                    <StatsCard
                        title="Tổng người dùng online"
                        value={activeUsers?.totalActiveUsers ?? 0}
                        icon={Users}
                        description="Đang hoạt động"
                    />
                    <StatsCard
                        title="Desktop"
                        value={activeUsers?.desktopUsers ?? 0}
                        icon={Monitor}
                    />
                    <StatsCard
                        title="Mobile"
                        value={activeUsers?.mobileUsers ?? 0}
                        icon={Smartphone}
                    />
                    <StatsCard
                        title="Tablet"
                        value={activeUsers?.tabletUsers ?? 0}
                        icon={Tablet}
                    />
                </div>
            )}

            {/* Active Sessions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Phiên hoạt động gần đây
                    </CardTitle>
                    <CardDescription>
                        Danh sách người dùng đang online (cập nhật mỗi 30 giây)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead>Thiết bị</TableHead>
                                    <TableHead>Hoạt động lần cuối</TableHead>
                                    <TableHead>Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeUsers?.recentSessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>
                                            <button
                                                className="text-left hover:underline font-medium"
                                                onClick={() => setSelectedUser({ id: session.userId, email: session.userEmail })}
                                            >
                                                {session.userEmail}
                                            </button>
                                            {session.userName && session.userName !== 'Unknown' && (
                                                <p className="text-xs text-muted-foreground">{session.userName}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <DeviceIcon type={session.deviceType} />
                                                <span className="text-sm">{session.deviceType}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                {formatTimeAgo(session.lastActivityTime)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedUser({ id: session.userId, email: session.userEmail })}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!activeUsers?.recentSessions || activeUsers.recentSessions.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            Không có phiên hoạt động nào
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* User Detail Dialog */}
            {selectedUser && (
                <UserDetailDialog
                    userId={selectedUser.id}
                    userEmail={selectedUser.email}
                    open={!!selectedUser}
                    onOpenChange={(open) => !open && setSelectedUser(null)}
                />
            )}
        </div>
    );
}

export default UserMonitoringPage;
