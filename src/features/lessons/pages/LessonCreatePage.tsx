/**
 * Lesson Create Page
 * Multi-step page for creating a new lesson
 * Step 1: Select lesson type
 * Step 2: Fill in lesson details based on selected type
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { LessonTypeSelector } from "../components/LessonTypeSelector";
import { ReadingLessonEditor } from "../components/ReadingLessonEditor";
import { useCourse } from "@/features/courses/hooks/useCourses";
import { useSections } from "@/features/courses/hooks/useSections";
import { useCreateLesson } from "../hooks/useLessons";
import api from "@/lib/api";
import type { LessonType, CreateLessonInput } from "../types/lesson.types";
import type { ReadingLessonFormData } from "../schemas/readingLesson.schema";
import type { Section } from "@/features/courses/types/course.types";

/** Page steps */
type Step = "select-type" | "edit-content";

/**
 * Calculate estimated reading time based on content
 * ~200 words per minute average reading speed
 */
function calculateReadingTime(data: ReadingLessonFormData): number {
  let totalWords = 0;

  // Count words in passages
  for (const passage of data.passages) {
    totalWords += passage.text.split(/\s+/).filter(Boolean).length;
    if (passage.title) {
      totalWords += passage.title.split(/\s+/).filter(Boolean).length;
    }
  }

  // Count words in questions (roughly 30 seconds per question)
  const questionMinutes = data.questions.length * 0.5;

  // Calculate reading time
  const readingMinutes = Math.ceil(totalWords / 200);

  return Math.max(1, readingMinutes + Math.ceil(questionMinutes));
}

/**
 * LessonCreatePage - Multi-step lesson creation
 */
export default function LessonCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get sectionId from URL query params
  const sectionIdParam = searchParams.get("sectionId");
  const sectionId = sectionIdParam ? parseInt(sectionIdParam, 10) : null;

  // State
  const [step, setStep] = useState<Step>("select-type");
  const [selectedType, setSelectedType] = useState<LessonType | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Mutations
  const createLessonMutation = useCreateLesson();

  // Fetch course data once we have courseId
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId || 0);

  // Fetch sections to find our section and validate it exists
  // We need to fetch sections from different courses to find our section
  // This is a workaround since sections are nested under courses
  const { data: sections } = useSections(courseId || 0);

  // Validate sectionId on mount
  useEffect(() => {
    const validateSection = async () => {
      setIsValidating(true);
      setValidationError(null);

      // Check if sectionId is provided
      if (!sectionId || isNaN(sectionId) || sectionId <= 0) {
        setValidationError(
          "Missing or invalid sectionId. Please go back to the course and add a lesson from a section."
        );
        setIsValidating(false);
        return;
      }

      // Try to get section info by fetching lessons for this section
      // If it returns successfully (even empty array), section exists
      try {
        // First, try to get lessons for this section - this will tell us if section exists
        // and give us the section info from a lesson if there are any
        const lessonsResponse = await api.get(`/lessons/sections/${sectionId}`);

        // Section exists! Now we need to find which course it belongs to
        // Check if there are lessons to get courseId from
        if (lessonsResponse.data.length > 0) {
          // We need to find the course this section belongs to
          // Try fetching courses and their sections
          const coursesResponse = await api.get("/courses", {
            params: { page: 0, size: 100 },
          });

          for (const c of coursesResponse.data.content) {
            const sectionsResponse = await api.get(`/courses/${c.id}/sections`);
            const foundSection = sectionsResponse.data.find(
              (s: Section) => s.id === sectionId
            );
            if (foundSection) {
              setCourseId(c.id);
              setCurrentSection(foundSection);
              setIsValidating(false);
              return;
            }
          }
        } else {
          // No lessons, but section might still exist
          // Search through courses to find section
          const coursesResponse = await api.get("/courses", {
            params: { page: 0, size: 100 },
          });

          for (const c of coursesResponse.data.content) {
            try {
              const sectionsResponse = await api.get(
                `/courses/${c.id}/sections`
              );
              const foundSection = sectionsResponse.data.find(
                (s: Section) => s.id === sectionId
              );
              if (foundSection) {
                setCourseId(c.id);
                setCurrentSection(foundSection);
                setIsValidating(false);
                return;
              }
            } catch {
              // Course might not have sections, continue
            }
          }
        }

        // If we get here, section wasn't found in any course
        setValidationError(
          "Section not found. It may have been deleted. Please go back to the course and try again."
        );
      } catch (error) {
        console.error("Error validating section:", error);
        setValidationError(
          "Unable to validate section. Please check your connection and try again."
        );
      }

      setIsValidating(false);
    };

    validateSection();
  }, [sectionId]);

  // Update currentSection when sections data changes
  useEffect(() => {
    if (sections && sectionId) {
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        setCurrentSection(section);
      }
    }
  }, [sections, sectionId]);

  // Handle type selection
  const handleTypeSelect = useCallback((type: LessonType) => {
    setSelectedType(type);
  }, []);

  // Handle continue to next step
  const handleContinue = useCallback(() => {
    if (!selectedType) {
      toast({
        variant: "destructive",
        title: "Please select a lesson type",
        description: "You must select a lesson type before continuing.",
      });
      return;
    }

    // Navigate to step 2 for supported types
    if (selectedType === "READING") {
      setStep("edit-content");
    } else {
      // Other editors coming soon
      toast({
        title: "Coming Soon",
        description: `The ${selectedType} lesson editor will be available in the next update.`,
      });
    }
  }, [selectedType, toast]);

  // Handle Reading lesson form submission
  const handleReadingLessonSubmit = useCallback(
    async (data: ReadingLessonFormData) => {
      if (!sectionId) return;

      // Build the lesson content from form data
      const content = {
        passages: data.passages,
        questions: data.questions,
        vocabulary: data.vocabulary || [],
      };

      // Get existing lessons count for order
      try {
        const lessonsResponse = await api.get(`/lessons/sections/${sectionId}`);
        const newOrder = lessonsResponse.data.length;

        const createData: CreateLessonInput = {
          title: data.title,
          lessonType: "READING",
          content: JSON.stringify(content),
          orderIndex: newOrder,
          durationMinutes: calculateReadingTime(data),
        };

        await createLessonMutation.mutateAsync({
          sectionId,
          data: createData,
        });

        toast({
          title: "Lesson Created",
          description: `"${data.title}" has been created successfully.`,
        });

        // Navigate back to course edit page
        if (courseId) {
          navigate(`/courses/${courseId}/edit`);
        } else {
          navigate("/courses");
        }
      } catch (error) {
        console.error("Error creating lesson:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create lesson. Please try again.",
        });
      }
    },
    [sectionId, courseId, createLessonMutation, navigate, toast]
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (step === "edit-content") {
      setStep("select-type");
    } else if (courseId) {
      navigate(`/courses/${courseId}/edit`);
    } else {
      navigate("/courses");
    }
  }, [step, courseId, navigate]);

  // Loading state
  if (isValidating || (courseId && isLoadingCourse)) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Validating section...</p>
        </div>
      </div>
    );
  }

  // Error state - invalid or missing sectionId
  if (validationError) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive">
                Invalid Request
              </CardTitle>
            </div>
            <CardDescription className="text-destructive/80">
              {validationError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/courses")}>Go to Courses</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {course && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/courses/${courseId}/edit`}>
                  {course.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {currentSection && (
            <>
              <BreadcrumbItem>
                <span className="text-muted-foreground">
                  {currentSection.title}
                </span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>Create Lesson</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Lesson</h1>
          {currentSection && course && (
            <p className="text-muted-foreground">
              Adding lesson to "{currentSection.title}" in "{course.title}"
            </p>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === "select-type"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          1
        </div>
        <span
          className={
            step === "select-type" ? "font-medium" : "text-muted-foreground"
          }
        >
          Select Type
        </span>
        <div className="flex-1 h-px bg-border mx-2" />
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === "edit-content"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={
            step === "edit-content" ? "font-medium" : "text-muted-foreground"
          }
        >
          Edit Content
        </span>
      </div>

      {/* Step Content */}
      {step === "select-type" && (
        <Card>
          <CardContent className="pt-6">
            <LessonTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeSelect}
              onContinue={handleContinue}
            />
          </CardContent>
        </Card>
      )}

      {step === "edit-content" && selectedType === "READING" && (
        <ReadingLessonEditor
          onSubmit={handleReadingLessonSubmit}
          onBack={() => setStep("select-type")}
          isSubmitting={createLessonMutation.isPending}
          submitLabel="Create Lesson"
        />
      )}

      {step === "edit-content" &&
        selectedType &&
        selectedType !== "READING" && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Content editor for {selectedType} lessons coming soon...
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setStep("select-type")}
                >
                  Back to Type Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
