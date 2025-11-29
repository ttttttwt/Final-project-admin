import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Activity, ActivityType } from "../types/dashboard.types";
import { formatDistanceToNow, format } from "date-fns";
import {
  BookOpen,
  Edit,
  Globe,
  EyeOff,
  Trash2,
  Layers,
  FileText,
  Eye,
  ClipboardList,
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

/**
 * Get action label from activity type
 */
function getActionLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    COURSE_CREATED: "Course Created",
    COURSE_UPDATED: "Course Updated",
    COURSE_PUBLISHED: "Course Published",
    COURSE_UNPUBLISHED: "Course Unpublished",
    COURSE_DELETED: "Course Deleted",
    SECTION_CREATED: "Section Created",
    SECTION_UPDATED: "Section Updated",
    SECTION_DELETED: "Section Deleted",
    LESSON_CREATED: "Lesson Created",
    LESSON_UPDATED: "Lesson Updated",
    LESSON_DELETED: "Lesson Deleted",
  };
  return labels[type] || type;
}

/**
 * Get badge variant based on activity type
 */
function getActionBadgeVariant(
  type: ActivityType
): "default" | "secondary" | "destructive" | "outline" {
  if (type.includes("DELETED")) return "destructive";
  if (type.includes("CREATED")) return "default";
  if (type.includes("PUBLISHED")) return "secondary";
  return "outline";
}

/**
 * Get entity type from activity type
 */
function getEntityType(type: ActivityType): string {
  if (type.startsWith("COURSE_")) return "COURSE";
  if (type.startsWith("SECTION_")) return "SECTION";
  if (type.startsWith("LESSON_")) return "LESSON";
  return "UNKNOWN";
}

/**
 * Entity type badge colors
 */
function getEntityTypeBadgeClass(entityType: string): string {
  switch (entityType) {
    case "COURSE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "SECTION":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "LESSON":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

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
                className="flex items-start cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => setSelectedActivity(activity)}
              >
                <Avatar
                  className={`h-9 w-9 ${getActivityColor(activity.type)}`}
                >
                  <AvatarFallback className={getActivityColor(activity.type)}>
                    {getActivityIcon(activity.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedActivity(activity);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Activity Details Dialog */}
      <Dialog
        open={!!selectedActivity}
        onOpenChange={() => setSelectedActivity(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Activity Details
            </DialogTitle>
            <DialogDescription>
              {selectedActivity && (
                <span>
                  {format(
                    new Date(selectedActivity.timestamp),
                    "MMMM d, yyyy 'at' HH:mm:ss"
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              {/* Summary Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground mb-1">
                    User
                  </div>
                  <div className="font-medium">
                    {selectedActivity.userName || "System"}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground mb-1">
                    Action
                  </div>
                  <Badge variant={getActionBadgeVariant(selectedActivity.type)}>
                    {getActionLabel(selectedActivity.type)}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground mb-1">
                    Entity Type
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getEntityTypeBadgeClass(
                      getEntityType(selectedActivity.type)
                    )}`}
                  >
                    {getEntityType(selectedActivity.type)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground mb-1">
                    Entity ID
                  </div>
                  <div className="font-mono text-xs">{selectedActivity.id}</div>
                </div>
                {selectedActivity.courseName && (
                  <div className="col-span-2">
                    <div className="font-medium text-muted-foreground mb-1">
                      Course Name
                    </div>
                    <div className="font-medium">
                      {selectedActivity.courseName}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="font-medium text-muted-foreground mb-2">
                  Description
                </div>
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="text-sm">{selectedActivity.description}</p>
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <div className="font-medium text-muted-foreground mb-1">
                  Timestamp
                </div>
                <div className="text-sm">
                  {format(new Date(selectedActivity.timestamp), "PPpp")}
                </div>
              </div>

              {/* Link to entity */}
              {selectedActivity.link && (
                <div className="pt-2">
                  <Link to={selectedActivity.link}>
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View {getEntityType(selectedActivity.type).toLowerCase()}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
