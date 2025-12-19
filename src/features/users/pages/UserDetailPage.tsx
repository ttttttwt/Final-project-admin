import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserDetail, useDeleteUser, useRestoreUser } from "../hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    GraduationCap,
    Sparkles,
    User,
    AlertTriangle,
    CheckCircle,
    XCircle,
    MapPin,
    Flame,
    Trash,
    MessageSquare,
    Layers,
    FileText,
    Zap,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: user, isLoading, error } = useUserDetail(id || "");
    const deleteUser = useDeleteUser();
    const restoreUser = useRestoreUser();

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="container mx-auto p-6">
                <Card className="bg-destructive/10 border-destructive">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                        <p className="text-destructive">Failed to load user details</p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate("/users")}>
                            Back to Users
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteUser.mutateAsync(id);
            toast({ title: "User moved to trash", variant: "default" });
            navigate("/users");
        } catch {
            toast({ title: "Failed to delete user", variant: "destructive" });
        }
    };

    const handleRestore = async () => {
        if (!id) return;
        try {
            await restoreUser.mutateAsync(id);
            toast({ title: "User restored", variant: "default" });
        } catch {
            toast({ title: "Failed to restore user", variant: "destructive" });
        }
    };

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";
    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">User Details</h1>
            </div>

            {/* User Info Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.avatarUrl} alt={fullName} />
                            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-2xl font-bold">{fullName}</h2>
                                {user.isDeleted && <Badge variant="destructive">Deleted</Badge>}
                                {user.isActive ? (
                                    <Badge variant="default" className="bg-green-600">Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                                {user.roles.map(role => (
                                    <Badge key={role} variant="outline">{role}</Badge>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" /> {user.email}
                                </span>
                                {user.phoneNumber && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" /> {user.phoneNumber}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" /> Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                                </span>
                                {user.timezone && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> {user.timezone}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {user.currentCefrLevel && (
                                    <Badge className="bg-blue-600">{user.currentCefrLevel}</Badge>
                                )}
                                {user.subscription && (
                                    <Badge variant={user.subscription.planType === "PREMIUM" ? "default" : "secondary"}>
                                        {user.subscription.planType}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {user.isDeleted ? (
                                <Button variant="outline" onClick={handleRestore} disabled={restoreUser.isPending}>
                                    Restore User
                                </Button>
                            ) : (
                                <Button variant="destructive" onClick={handleDelete} disabled={deleteUser.isPending}>
                                    <Trash className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="learning">Learning Progress</TabsTrigger>
                    <TabsTrigger value="ai">AI Usage</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Stats Cards */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" /> Enrolled Courses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{user.enrolledCourses.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {user.learningStats?.completedCourses || 0} completed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" /> Learning Paths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{user.enrolledPaths.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {user.learningStats?.completedPaths || 0} completed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Flame className="h-4 w-4" /> Streak
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{user.learningStats?.currentStreak || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Best: {user.learningStats?.bestStreak || 0} days
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Placement History */}
                    {user.placementHistory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" /> Placement Test History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {user.placementHistory.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div>
                                                <Badge className="bg-blue-600 mr-2">{result.assignedLevel}</Badge>
                                                <span className="text-sm">
                                                    {result.score}/{result.totalQuestions} correct
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(result.createdAt), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Bio */}
                    {user.bio && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" /> Bio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{user.bio}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Learning Progress Tab */}
                <TabsContent value="learning" className="space-y-4">
                    {/* Enrolled Courses */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrolled Courses ({user.enrolledCourses.length})</CardTitle>
                            <CardDescription>Courses the user is enrolled in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.enrolledCourses.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No enrolled courses</p>
                            ) : (
                                <div className="space-y-3">
                                    {user.enrolledCourses.map((enrollment) => (
                                        <div key={enrollment.courseId} className="flex items-center gap-4 p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{enrollment.courseName}</span>
                                                    <Badge variant="outline">{enrollment.cefrLevel}</Badge>
                                                    {enrollment.isCompleted && (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Progress value={enrollment.progressPercentage} className="flex-1 h-2" />
                                                    <span className="text-sm text-muted-foreground w-12">
                                                        {enrollment.progressPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enrolled Learning Paths */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Paths ({user.enrolledPaths.length})</CardTitle>
                            <CardDescription>Learning paths the user is following</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.enrolledPaths.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No enrolled learning paths</p>
                            ) : (
                                <div className="space-y-3">
                                    {user.enrolledPaths.map((path) => (
                                        <div key={path.pathId} className="p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{path.pathName}</span>
                                                {path.completedAt && (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                )}
                                            </div>
                                            {path.pathDescription && (
                                                <p className="text-sm text-muted-foreground mt-1">{path.pathDescription}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Started: {format(new Date(path.startedAt), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Usage Tab */}
                <TabsContent value="ai" className="space-y-4">
                    {/* AI Quota */}
                    {user.aiQuota && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5" /> AI Features Quota
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            <Badge variant={user.aiQuota.planType === 'FREE' ? 'secondary' : 'default'} className="mr-2">
                                                {user.aiQuota.planType || 'FREE'} Plan
                                            </Badge>
                                            {user.aiQuota.isSuspended && (
                                                <Badge variant="destructive">Suspended</Badge>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        {user.aiQuota.daysUntilReset !== undefined && (
                                            <span>Resets in {user.aiQuota.daysUntilReset} days</span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Total AI Requests */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <span className="font-medium">Total AI Requests</span>
                                        </div>
                                        <span className="text-sm">
                                            {user.aiQuota.totalRequestsUsed ?? user.aiQuota.monthlyUsed ?? 0}/
                                            {user.aiQuota.totalRequestsLimit ?? user.aiQuota.monthlyLimit ?? 0}
                                            {' '}({Math.round(((user.aiQuota.totalRequestsUsed ?? user.aiQuota.monthlyUsed ?? 0) /
                                                (user.aiQuota.totalRequestsLimit ?? user.aiQuota.monthlyLimit ?? 1)) * 100)}%)
                                        </span>
                                    </div>
                                    <Progress
                                        value={((user.aiQuota.totalRequestsUsed ?? user.aiQuota.monthlyUsed ?? 0) /
                                            (user.aiQuota.totalRequestsLimit ?? user.aiQuota.monthlyLimit ?? 1)) * 100}
                                        className="h-2"
                                    />
                                </div>

                                {/* Feature Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Role Play */}
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium text-sm">Role Play</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {user.aiQuota.roleplaySessionsUsed ?? 0}/{user.aiQuota.roleplaySessionsLimit ?? 50}
                                        </div>
                                        <p className="text-xs text-muted-foreground">sessions</p>
                                        <Progress
                                            value={((user.aiQuota.roleplaySessionsUsed ?? 0) /
                                                (user.aiQuota.roleplaySessionsLimit ?? 50)) * 100}
                                            className="h-1 mt-2"
                                        />
                                    </div>

                                    {/* Flashcard Decks */}
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Layers className="h-4 w-4 text-green-500" />
                                            <span className="font-medium text-sm">Flashcard Decks</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {user.aiQuota.flashcardDecksUsed ?? 0}/{user.aiQuota.flashcardDecksLimit ?? 30}
                                        </div>
                                        <p className="text-xs text-muted-foreground">decks</p>
                                        <Progress
                                            value={((user.aiQuota.flashcardDecksUsed ?? 0) /
                                                (user.aiQuota.flashcardDecksLimit ?? 30)) * 100}
                                            className="h-1 mt-2"
                                        />
                                    </div>

                                    {/* Grammar Exercises */}
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="h-4 w-4 text-purple-500" />
                                            <span className="font-medium text-sm">Grammar Exercises</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {user.aiQuota.grammarExercisesUsed ?? 0}/{user.aiQuota.grammarExercisesLimit ?? 300}
                                        </div>
                                        <p className="text-xs text-muted-foreground">exercises</p>
                                        <Progress
                                            value={((user.aiQuota.grammarExercisesUsed ?? 0) /
                                                (user.aiQuota.grammarExercisesLimit ?? 300)) * 100}
                                            className="h-1 mt-2"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent AI Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent AI Usage ({user.recentAiUsage.length})</CardTitle>
                            <CardDescription>Last 20 AI requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.recentAiUsage.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No AI usage recorded</p>
                            ) : (
                                <div className="space-y-2">
                                    {user.recentAiUsage.slice(0, 10).map((usage) => (
                                        <div key={usage.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{usage.contentType}</Badge>
                                                {usage.success ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className="text-sm text-muted-foreground">
                                                    {usage.inputTokens + usage.outputTokens} tokens
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(usage.createdAt), "MMM d, HH:mm")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserDetailPage;
