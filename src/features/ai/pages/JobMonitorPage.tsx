import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCw, Play, RotateCcw, Trash2, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useJobs, useJobStats, useRetryJob, useResetRetryCount, useDeleteJob } from '../hooks/useCustomMaterialAdmin';
import type { AdminJob, JobStatus, JobQueryParams } from '../types/customMaterialAdmin';

/**
 * Admin page for monitoring custom material processing jobs.
 * 
 * Features:
 * - Stats cards (Total, Completed, Failed, Stuck)
 * - Job list table with filtering
 * - Retry, Reset Retries, and Delete actions
 * 
 * @since Sprint 6
 */
export function JobMonitorPage() {
    const [params, setParams] = useState<JobQueryParams>({ page: 0, size: 20 });

    const { data: jobsData, isLoading, refetch } = useJobs(params);
    const { data: stats } = useJobStats();
    const retryMutation = useRetryJob();
    const resetMutation = useResetRetryCount();
    const deleteMutation = useDeleteJob();

    const handleStatusFilter = (value: string) => {
        setParams(prev => ({
            ...prev,
            status: value === 'all' ? undefined : value as JobStatus,
            stuckOnly: value === 'stuck' ? true : undefined,
        }));
    };

    const getStatusBadge = (status: string, isStuck?: boolean) => {
        if (isStuck) {
            return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />STUCK</Badge>;
        }
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
            case 'FAILED':
                return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
            case 'PROCESSING':
                return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Processing</Badge>;
            case 'QUEUED':
                return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Queued</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Job Monitor</h1>
                    <p className="text-muted-foreground">Monitor custom material processing jobs</p>
                </div>
                <Button variant="outline" onClick={() => refetch()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Jobs</CardDescription>
                        <CardTitle className="text-3xl">{stats?.totalJobs ?? 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Completed</CardDescription>
                        <CardTitle className="text-3xl text-green-600">{stats?.completedJobs ?? 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Success rate: {stats?.successRate ?? 0}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Failed</CardDescription>
                        <CardTitle className="text-3xl text-red-600">{stats?.failedJobs ?? 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className={stats?.stuckJobs ? 'border-orange-500' : ''}>
                    <CardHeader className="pb-2">
                        <CardDescription>Stuck Jobs</CardDescription>
                        <CardTitle className="text-3xl text-orange-600">{stats?.stuckJobs ?? 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Processing &gt; 10 min
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <Select onValueChange={handleStatusFilter} defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="QUEUED">Queued</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="stuck">Stuck Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Jobs Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Retries</TableHead>
                                <TableHead>Started</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : jobsData?.content.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No jobs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobsData?.content.map((job: AdminJob) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="max-w-[200px] truncate" title={job.materialTitle}>
                                            {job.materialTitle || 'Unknown'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{job.userEmail || 'Unknown'}</span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(job.status, job.isStuck)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${job.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-muted-foreground">{job.progress}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={job.retryCount >= job.maxRetries ? 'text-red-600' : ''}>
                                                {job.retryCount}/{job.maxRetries}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(job.startedAt)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {job.status === 'FAILED' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => retryMutation.mutate(job.id)}
                                                        disabled={retryMutation.isPending}
                                                        title="Retry job"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {(job.status === 'FAILED' && job.retryCount >= job.maxRetries) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => resetMutation.mutate(job.id)}
                                                        disabled={resetMutation.isPending}
                                                        title="Reset retry count"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {(job.isStuck || job.status === 'FAILED') && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-destructive" title="Delete job">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will delete the job and mark the material as failed. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteMutation.mutate(job.id)}
                                                                    className="bg-destructive text-destructive-foreground"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Error Display */}
            {jobsData?.content.some(j => j.lastError) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Errors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {jobsData.content
                            .filter(j => j.lastError)
                            .slice(0, 5)
                            .map(job => (
                                <div key={job.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                                    <p className="font-medium text-sm">{job.materialTitle}</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">{job.lastError}</p>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default JobMonitorPage;
