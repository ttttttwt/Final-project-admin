/**
 * Course Create Page
 * Page for creating a new course
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CourseForm } from "../components/CourseForm";
import { useCreateCourse } from "../hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import type {
  CreateCourseInput,
  UpdateCourseInput,
} from "../types/course.types";

/**
 * CourseCreatePage - Page for creating a new course
 */
export default function CourseCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createCourse = useCreateCourse();

  const handleSubmit = async (data: CreateCourseInput | UpdateCourseInput) => {
    try {
      const newCourse = await createCourse.mutateAsync(
        data as CreateCourseInput
      );
      toast({
        title: "Course created",
        description: `"${newCourse.title}" has been created successfully.`,
      });
      // Navigate to edit page so user can add sections
      navigate(`/courses/${newCourse.id}/edit`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to create course";
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
          <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
          <p className="text-muted-foreground">
            Add a new course to the platform
          </p>
        </div>
      </div>

      {/* Course Form */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Enter the basic information for your course. You can add sections
            and lessons after creating the course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            onSubmit={handleSubmit}
            isLoading={createCourse.isPending}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
