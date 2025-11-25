import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Activity } from "../types/dashboard.types";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
    activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest actions across the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent activity.</p>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{activity.type.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{activity.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
