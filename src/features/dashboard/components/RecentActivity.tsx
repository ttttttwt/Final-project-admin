import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Activity, ActivityType } from "../types/dashboard.types";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Edit,
  Globe,
  EyeOff,
  Trash2,
  Layers,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

interface RecentActivityProps {
  activities: Activity[];
}

/**
 * Get icon component based on activity type
 */
function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "COURSE_CREATED":
      return <BookOpen className="h-4 w-4" />;
    case "COURSE_UPDATED":
      return <Edit className="h-4 w-4" />;
    case "COURSE_PUBLISHED":
      return <Globe className="h-4 w-4" />;
    case "COURSE_UNPUBLISHED":
      return <EyeOff className="h-4 w-4" />;
    case "COURSE_DELETED":
      return <Trash2 className="h-4 w-4" />;
    case "SECTION_CREATED":
    case "SECTION_UPDATED":
    case "SECTION_DELETED":
      return <Layers className="h-4 w-4" />;
    case "LESSON_CREATED":
    case "LESSON_UPDATED":
    case "LESSON_DELETED":
      return <FileText className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

/**
 * Get background color class based on activity type
 */
function getActivityColor(type: ActivityType): string {
  switch (type) {
    case "COURSE_CREATED":
    case "SECTION_CREATED":
    case "LESSON_CREATED":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
    case "COURSE_UPDATED":
    case "SECTION_UPDATED":
    case "LESSON_UPDATED":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300";
    case "COURSE_PUBLISHED":
      return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";
    case "COURSE_UNPUBLISHED":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300";
    case "COURSE_DELETED":
    case "SECTION_DELETED":
    case "LESSON_DELETED":
      return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Activities will appear here when courses, sections, or lessons
                are created, updated, or deleted.
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-start"
              >
                <Avatar
                  className={`h-9 w-9 ${getActivityColor(activity.type)}`}
                >
                  <AvatarFallback className={getActivityColor(activity.type)}>
                    {getActivityIcon(activity.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1 flex-1">
                  {activity.link ? (
                    <Link
                      to={activity.link}
                      className="text-sm font-medium leading-none hover:underline"
                    >
                      {activity.description}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
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
