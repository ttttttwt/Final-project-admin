/**
 * Course Edit Page
 * Page for editing an existing course
 */

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Globe, GlobeLock, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CourseForm } from "../components/CourseForm";
import { SectionManager } from "../components/SectionManager";
import { ThumbnailUpload } from "../components/ThumbnailUpload";
import {
  useCourse,
  useUpdateCourse,
  usePublishCourse,
  useUnpublishCourse,
  courseKeys,
} from "../hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type {
  CreateCourseInput,
  UpdateCourseInput,
} from "../types/course.types";
import { useState, useCallback } from "react";

/**
 * CourseEditPage - Page for editing an existing course
 */
export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0", 10);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch course data
  const {
    data: course,
    isLoading: isLoadingCourse,
    error,
  } = useCourse(courseId);

  // Mutations
  const updateCourse = useUpdateCourse();
  const publishCourse = usePublishCourse();
  const unpublishCourse = useUnpublishCourse();

  // Publish dialog state
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Handler for adding lessons - navigate to lesson create page
  const handleAddLesson = useCallback(
    (sectionId: number) => {
      navigate(`/lessons/create?sectionId=${sectionId}`);
    },
    [navigate]
  );

  const handleSubmit = async (data: CreateCourseInput | UpdateCourseInput) => {
    try {
      await updateCourse.mutateAsync({
        id: courseId,
        data: data as UpdateCourseInput,
      });
      toast({
        title: "Course updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to update course";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleCancel = () => {
    navigate("/courses");
  };

  const handleTogglePublish = () => {
    setIsPublishDialogOpen(true);
  };

  const handlePublishConfirm = async () => {
    if (!course) return;

    try {
      if (course.isPublished) {
        await unpublishCourse.mutateAsync(courseId);
        toast({
          title: "Course unpublished",
          description: `"${course.title}" is now hidden from learners.`,
        });
      } else {
        await publishCourse.mutateAsync(courseId);
        toast({
          title: "Course published",
          description: `"${course.title}" is now visible to learners.`,
        });
      }
      setIsPublishDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
            `Failed to ${course.isPublished ? "unpublish" : "publish"} course`;
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Loading state
  if (isLoadingCourse) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Course not found
          </p>
          <p className="text-sm text-muted-foreground">
            The course you're looking for doesn't exist or was deleted.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/courses")}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/courses")}
            aria-label="Back to courses"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/courses/${courseId}/preview`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            variant={course.isPublished ? "destructive" : "default"}
            onClick={handleTogglePublish}
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
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">CEFR Level</p>
            <p className="text-2xl font-bold">{course.cefrLevel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sections</p>
            <p className="text-2xl font-bold">{course.sectionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-2xl font-bold">
              {course.isPublished ? "Published" : "Draft"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-2xl font-bold">
              {new Date(course.updatedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Update the basic information for this course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            initialData={course}
            onSubmit={handleSubmit}
            isLoading={updateCourse.isPending}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {/* Course Thumbnail */}
      <Card>
        <CardHeader>
          <CardTitle>Course Thumbnail</CardTitle>
          <CardDescription>
            Upload a thumbnail image to represent this course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThumbnailUpload
            courseId={courseId}
            currentThumbnailUrl={course.thumbnailUrl}
            onUploadSuccess={() => {
              // Refetch course data to update thumbnail URL
              queryClient.invalidateQueries({
                queryKey: courseKeys.detail(courseId),
              });
            }}
            onDeleteSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: courseKeys.detail(courseId),
              });
            }}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Sections Management */}
      <SectionManager courseId={courseId} onAddLesson={handleAddLesson} />

      {/* Publish/Unpublish Dialog */}
      <ConfirmDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        title={course.isPublished ? "Unpublish Course" : "Publish Course"}
        description={
          course.isPublished
            ? `Are you sure you want to unpublish "${course.title}"? This will hide it from learners.`
            : course.sectionCount === 0
            ? `Warning: "${course.title}" has no sections. Publishing may fail. Continue anyway?`
            : `Are you sure you want to publish "${course.title}"? This will make it visible to all learners.`
        }
        confirmLabel={course.isPublished ? "Unpublish" : "Publish"}
        cancelLabel="Cancel"
        onConfirm={handlePublishConfirm}
        variant={course.isPublished ? "destructive" : "default"}
        isLoading={publishCourse.isPending || unpublishCourse.isPending}
      />
    </div>
  );
}
