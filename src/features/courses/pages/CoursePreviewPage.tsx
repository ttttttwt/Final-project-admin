/**
 * Course Preview Page
 * Preview a course as it would appear to learners
 */

import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Globe,
  GlobeLock,
  Loader2,
  BookOpen,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

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
import {
  useCourse,
  usePublishCourse,
  useUnpublishCourse,
} from "../hooks/useCourses";
import { useSections } from "../hooks/useSections";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useState } from "react";

/** CEFR level descriptions */
const cefrDescriptions: Record<string, string> = {
  A1: "Beginner - Can understand and use basic phrases",
  A2: "Elementary - Can communicate in simple, routine tasks",
  B1: "Intermediate - Can deal with most situations likely to arise",
  B2: "Upper Intermediate - Can interact with fluency and spontaneity",
  C1: "Advanced - Can use language flexibly for social, academic and professional purposes",
  C2: "Proficiency - Can understand virtually everything and express themselves spontaneously",
};

/**
 * CoursePreviewPage - Preview page for a course
 */
export default function CoursePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0", 10);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch course data
  const { data: course, isLoading, error } = useCourse(courseId);

  // Fetch sections for the course
  const {
    data: sections,
    isLoading: isLoadingSections,
    error: sectionsError,
  } = useSections(courseId);

  // Mutations
  const publishCourse = usePublishCourse();
  const unpublishCourse = useUnpublishCourse();

  // Publish dialog state
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

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
  if (isLoading) {
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
              <h1 className="text-3xl font-bold tracking-tight">
                Course Preview
              </h1>
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Preview how learners will see this course
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/courses/${courseId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
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

      {/* Course Hero Section */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-3">
          {/* Thumbnail */}
          <div className="relative h-64 bg-muted md:h-auto">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="col-span-2 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline">{course.cefrLevel}</Badge>
              <span className="text-sm text-muted-foreground">
                {cefrDescriptions[course.cefrLevel]}
              </span>
            </div>

            <h2 className="mb-4 text-2xl font-bold">{course.title}</h2>

            {course.description ? (
              <p className="mb-6 text-muted-foreground">{course.description}</p>
            ) : (
              <p className="mb-6 italic text-muted-foreground">
                No description provided
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="font-medium">CEFR Level</p>
                <p className="text-muted-foreground">{course.cefrLevel}</p>
              </div>
              <div>
                <p className="font-medium">Sections</p>
                <p className="text-muted-foreground">{course.sectionCount}</p>
              </div>
              <div>
                <p className="font-medium">Created</p>
                <p className="text-muted-foreground">
                  {format(new Date(course.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="font-medium">Updated</p>
                <p className="text-muted-foreground">
                  {format(new Date(course.updatedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Course Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            Preview the sections and lessons in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSections ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sectionsError ? (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <p className="text-destructive">Failed to load sections</p>
                <p className="text-sm text-muted-foreground">
                  Please try again later.
                </p>
              </div>
            </div>
          ) : !sections || sections.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No content yet</p>
                <p className="text-sm text-muted-foreground">
                  This course doesn't have any sections or lessons yet.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/courses/${courseId}/edit`)}
                >
                  Add Content
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{section.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        {section.lessonCount} lesson
                        {section.lessonCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Section {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Warning for Empty Courses */}
      {!course.isPublished && course.sectionCount === 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-yellow-500/10 p-2">
                <Globe className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Cannot Publish
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This course needs at least one section with lessons before it
                  can be published. Add content to enable publishing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
