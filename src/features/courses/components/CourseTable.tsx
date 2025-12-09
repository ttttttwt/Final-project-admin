/**
 * Course Table Component
 * Displays courses in a data table with actions for edit, delete, publish/unpublish
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Globe,
  GlobeLock,
} from "lucide-react";
import { format } from "date-fns";

import type { Course } from "../types/course.types";
import {
  useDeleteCourse,
  usePublishCourse,
  useUnpublishCourse,
} from "../hooks/useCourses";
import {
  DataTable,
  type ColumnDef,
  type PaginationState,
} from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/utils";

interface CourseTableProps {
  courses: Course[];
  pagination: PaginationState;
  onPaginationChange: (page: number, size: number) => void;
  isLoading: boolean;
}

/**
 * Get badge variant for CEFR level
 */
const getCEFRBadgeVariant = (
  level: string
): "default" | "secondary" | "outline" => {
  switch (level) {
    case "A1":
    case "A2":
      return "secondary";
    case "B1":
    case "B2":
      return "default";
    case "C1":
    case "C2":
      return "outline";
    default:
      return "secondary";
  }
};

/**
 * CourseTable - Displays a list of courses with actions
 */
export function CourseTable({
  courses,
  pagination,
  onPaginationChange,
  isLoading,
}: CourseTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Delete course state
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Publish/unpublish state
  const [courseToTogglePublish, setCourseToTogglePublish] =
    useState<Course | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Mutations
  const deleteMutation = useDeleteCourse();
  const publishMutation = usePublishCourse();
  const unpublishMutation = useUnpublishCourse();

  // Handle row click - navigate to preview
  const handleRowClick = (course: Course) => {
    navigate(`/courses/${course.id}/preview`);
  };

  // Handle delete click
  const handleDeleteClick = (course: Course) => {
    if (course.isPublished) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description:
          "Published courses cannot be deleted. Unpublish the course first.",
      });
      return;
    }
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      await deleteMutation.mutateAsync(courseToDelete.id);
      toast({
        title: "Course deleted",
        description: `"${courseToDelete.title}" has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to delete course";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Handle publish/unpublish click
  const handleTogglePublishClick = (course: Course) => {
    setCourseToTogglePublish(course);
    setIsPublishDialogOpen(true);
  };

  // Handle publish/unpublish confirmation
  const handleTogglePublishConfirm = async () => {
    if (!courseToTogglePublish) return;

    try {
      if (courseToTogglePublish.isPublished) {
        await unpublishMutation.mutateAsync(courseToTogglePublish.id);
        toast({
          title: "Course unpublished",
          description: `"${courseToTogglePublish.title}" is now hidden from learners.`,
        });
      } else {
        await publishMutation.mutateAsync(courseToTogglePublish.id);
        toast({
          title: "Course published",
          description: `"${courseToTogglePublish.title}" is now visible to learners.`,
        });
      }
      setIsPublishDialogOpen(false);
      setCourseToTogglePublish(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
            `Failed to ${
              courseToTogglePublish.isPublished ? "unpublish" : "publish"
            } course`;
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Handle dialog close
  const handleDeleteDialogClose = (open: boolean) => {
    if (!open) {
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handlePublishDialogClose = (open: boolean) => {
    if (!open) {
      setIsPublishDialogOpen(false);
      setCourseToTogglePublish(null);
    }
  };

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "thumbnail",
      header: "",
      className: "w-16",
      cell: (course) => (
        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
          {course.thumbnailUrl ? (
            <img
              src={getImageUrl(course.thumbnailUrl)}
              alt={course.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Hide broken images
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              📚
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: (course) => (
        <div className="max-w-[200px]">
          <p className="font-medium truncate">{course.title}</p>
          {course.description && (
            <p className="text-xs text-muted-foreground truncate">
              {course.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "cefrLevel",
      header: "CEFR Level",
      cell: (course) => (
        <Badge variant={getCEFRBadgeVariant(course.cefrLevel)}>
          {course.cefrLevel}
        </Badge>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: (course) => (
        <Badge variant={course.isPublished ? "default" : "secondary"}>
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "sectionCount",
      header: "Sections",
      cell: (course) => (
        <span className="text-muted-foreground">{course.sectionCount}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: (course) => (
        <span className="text-muted-foreground">
          {format(new Date(course.updatedAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "edit",
      header: "",
      className: "w-20",
      cell: (course) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${course.id}/edit`);
          }}
          className="h-8 px-2"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (course) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/courses/${course.id}/preview`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleTogglePublishClick(course)}
              >
                {course.isPublished ? (
                  <>
                    <GlobeLock className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteClick(course)}
                disabled={course.isPublished}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={courses}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
        emptyMessage="No courses found. Create your first course to get started."
        onRowClick={handleRowClick}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        title="Delete Course"
        description={
          courseToDelete
            ? `Are you sure you want to delete "${courseToDelete.title}"? This will also delete all sections and lessons. This action cannot be undone.`
            : "Are you sure you want to delete this course?"
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      {/* Publish/Unpublish Confirmation Dialog */}
      <ConfirmDialog
        open={isPublishDialogOpen}
        onOpenChange={handlePublishDialogClose}
        title={
          courseToTogglePublish?.isPublished
            ? "Unpublish Course"
            : "Publish Course"
        }
        description={
          courseToTogglePublish?.isPublished
            ? `Are you sure you want to unpublish "${courseToTogglePublish?.title}"? This will hide it from learners.`
            : courseToTogglePublish?.sectionCount === 0
            ? `Warning: "${courseToTogglePublish?.title}" has no sections. Publishing may fail. Continue anyway?`
            : `Are you sure you want to publish "${courseToTogglePublish?.title}"? This will make it visible to all learners.`
        }
        confirmLabel={
          courseToTogglePublish?.isPublished ? "Unpublish" : "Publish"
        }
        cancelLabel="Cancel"
        onConfirm={handleTogglePublishConfirm}
        variant={courseToTogglePublish?.isPublished ? "destructive" : "default"}
        isLoading={publishMutation.isPending || unpublishMutation.isPending}
      />
    </>
  );
}
