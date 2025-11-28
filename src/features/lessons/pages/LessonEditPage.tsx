/**
 * Lesson Edit Page
 * Page for editing an existing lesson
 * Loads lesson data and renders the appropriate editor based on lesson type
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { ReadingLessonEditor } from "../components/ReadingLessonEditor";
import { ListeningLessonEditor } from "../components/ListeningLessonEditor";
import { QuizLessonEditor } from "../components/QuizLessonEditor";
import { SpeakingLessonEditor } from "../components/SpeakingLessonEditor";
import { useLesson, useUpdateLesson } from "../hooks/useLessons";
import api from "@/lib/api";
import type {
  UpdateLessonInput,
  ReadingLessonContent,
  ListeningLessonContent,
  QuizLessonContent,
  SpeakingLessonContent,
} from "../types/lesson.types";
import type { ReadingLessonFormData } from "../schemas/readingLesson.schema";
import type { ListeningLessonFormData } from "../schemas/listeningLesson.schema";
import type { QuizLessonFormData } from "../schemas/quizLesson.schema";
import type { SpeakingLessonFormData } from "../schemas/speakingLesson.schema";
import { calculateQuizDuration } from "../schemas/quizLesson.schema";
import { calculateSpeakingDuration } from "../schemas/speakingLesson.schema";
import type { Section, Course } from "@/features/courses/types/course.types";

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
 * LessonEditPage - Edit an existing lesson
 */
export default function LessonEditPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || "0", 10);
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for course and section info
  const [courseId, setCourseId] = useState<number | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);

  // Fetch lesson data
  const { data: lesson, isLoading, error } = useLesson(lessonId);

  // Update mutation
  const updateLessonMutation = useUpdateLesson();

  // Fetch course and section info once we have the lesson
  useEffect(() => {
    const fetchContext = async () => {
      if (!lesson) return;

      setIsLoadingContext(true);
      try {
        // Try fetching all courses to find which one contains this section
        const coursesResponse = await api.get("/courses/search", {
          params: { page: 0, size: 100 },
        });

        for (const c of coursesResponse.data.content) {
          try {
            const sectionsResponse = await api.get(`/courses/${c.id}/sections`);
            const foundSection = sectionsResponse.data.find(
              (s: Section) => s.id === lesson.sectionId
            );
            if (foundSection) {
              setCourseId(c.id);
              setCourse(c);
              setSection(foundSection);
              break;
            }
          } catch {
            // Course might not have sections, continue
          }
        }
      } catch (error) {
        console.error("Error fetching context:", error);
      }
      setIsLoadingContext(false);
    };

    fetchContext();
  }, [lesson]);

  // Parse lesson content
  const getParsedContent = useCallback(() => {
    if (!lesson) return null;
    try {
      return typeof lesson.content === "string"
        ? JSON.parse(lesson.content)
        : lesson.content;
    } catch {
      return null;
    }
  }, [lesson]);

  // Get initial data for Reading lesson editor
  const getReadingInitialData = useCallback(():
    | Partial<ReadingLessonFormData>
    | undefined => {
    if (!lesson || lesson.lessonType !== "READING") return undefined;
    const content = getParsedContent() as ReadingLessonContent | null;
    if (!content) return undefined;

    // Map content to form data format, handling type differences
    const questions = (content.questions || []).map((q) => ({
      question: q.question,
      type: q.type as "multiple_choice" | "true_false" | "short_answer",
      options: q.options,
      // Ensure correctAnswer is string or number, not string[]
      correctAnswer: Array.isArray(q.correctAnswer)
        ? q.correctAnswer[0] ?? ""
        : q.correctAnswer,
      explanation: q.explanation,
    }));

    const vocabulary = (content.vocabulary || []).map((v) => ({
      word: v.word,
      definition: v.definition,
      example: v.example,
      partOfSpeech: v.partOfSpeech as
        | "noun"
        | "verb"
        | "adjective"
        | "adverb"
        | "preposition"
        | "conjunction"
        | "pronoun"
        | "interjection"
        | undefined,
    }));

    return {
      title: lesson.title,
      passages: content.passages || [],
      questions,
      vocabulary,
    };
  }, [lesson, getParsedContent]);

  // Get initial data for Listening lesson editor
  const getListeningInitialData = useCallback(():
    | Partial<ListeningLessonFormData>
    | undefined => {
    if (!lesson || lesson.lessonType !== "LISTENING") return undefined;
    const content = getParsedContent() as ListeningLessonContent | null;
    if (!content) return undefined;

    // Map content to form data format, handling type differences
    const questions = (content.questions || []).map((q) => ({
      question: q.question,
      type: q.type as "multiple_choice" | "true_false" | "fill_blank",
      options: q.options,
      // Ensure correctAnswer is string or number, not string[]
      correctAnswer: Array.isArray(q.correctAnswer)
        ? q.correctAnswer[0] ?? ""
        : q.correctAnswer,
      explanation: q.explanation,
      timestamp: q.timestamp,
    }));

    const vocabulary = (content.vocabulary || []).map((v) => ({
      word: v.word,
      definition: v.definition,
      example: v.example,
      partOfSpeech: v.partOfSpeech as
        | "noun"
        | "verb"
        | "adjective"
        | "adverb"
        | "preposition"
        | "conjunction"
        | "pronoun"
        | "interjection"
        | undefined,
      timestamp: v.timestamp,
    }));

    return {
      title: lesson.title,
      audioUrl: content.audioUrl || "",
      duration: content.duration || 0,
      transcript: content.transcript || "",
      showTranscript: content.showTranscript ?? true,
      questions,
      vocabulary,
    };
  }, [lesson, getParsedContent]);

  // Get initial data for Quiz lesson editor
  const getQuizInitialData = useCallback(():
    | Partial<QuizLessonFormData>
    | undefined => {
    if (!lesson || lesson.lessonType !== "QUIZ") return undefined;
    const content = getParsedContent() as QuizLessonContent | null;
    if (!content) return undefined;

    // Map content to form data format, handling type differences
    const questions = (content.questions || []).map((q) => ({
      question: q.question,
      type: q.type as
        | "multiple_choice"
        | "true_false"
        | "fill_blank"
        | "matching",
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points ?? 1, // Default to 1 if undefined
      explanation: q.explanation,
      hint: q.hint,
    }));

    return {
      title: lesson.title,
      quizTitle: content.title || "",
      instructions: content.instructions || "",
      timeLimit: content.timeLimit,
      passingScore: content.passingScore || 70,
      questions,
    };
  }, [lesson, getParsedContent]);

  // Get initial data for Speaking lesson editor
  const getSpeakingInitialData = useCallback(():
    | Partial<SpeakingLessonFormData>
    | undefined => {
    if (!lesson || lesson.lessonType !== "SPEAKING") return undefined;
    const content = getParsedContent() as SpeakingLessonContent | null;
    if (!content) return undefined;

    return {
      title: lesson.title,
      scenario: content.scenario || "",
      difficulty: content.difficulty || "beginner",
      prompts: content.prompts || [],
      rolePlaySettings: content.rolePlaySettings,
    };
  }, [lesson, getParsedContent]);

  // Handle Reading lesson form submission
  const handleReadingLessonSubmit = useCallback(
    async (data: ReadingLessonFormData) => {
      if (!lesson) return;

      const content = {
        passages: data.passages,
        questions: data.questions,
        vocabulary: data.vocabulary || [],
      };

      const updateData: UpdateLessonInput = {
        title: data.title,
        content: JSON.stringify(content),
        durationMinutes: calculateReadingTime(data),
      };

      try {
        await updateLessonMutation.mutateAsync({
          id: lessonId,
          data: updateData,
        });

        toast({
          title: "Lesson Updated",
          description: `"${data.title}" has been updated successfully.`,
        });

        // Navigate back to course edit page
        if (courseId) {
          navigate(`/courses/${courseId}/edit`);
        } else {
          navigate("/courses");
        }
      } catch (error) {
        console.error("Error updating lesson:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update lesson. Please try again.",
        });
      }
    },
    [lesson, lessonId, courseId, updateLessonMutation, navigate, toast]
  );

  // Handle Listening lesson form submission
  const handleListeningLessonSubmit = useCallback(
    async (data: ListeningLessonFormData) => {
      if (!lesson) return;

      const content = {
        audioUrl: data.audioUrl,
        duration: data.duration,
        transcript: data.transcript,
        showTranscript: data.showTranscript,
        questions: data.questions,
        vocabulary: data.vocabulary || [],
      };

      const durationMinutes =
        Math.ceil(data.duration / 60) + Math.ceil(data.questions.length * 0.5);

      const updateData: UpdateLessonInput = {
        title: data.title,
        content: JSON.stringify(content),
        durationMinutes: durationMinutes,
      };

      try {
        await updateLessonMutation.mutateAsync({
          id: lessonId,
          data: updateData,
        });

        toast({
          title: "Lesson Updated",
          description: `"${data.title}" has been updated successfully.`,
        });

        if (courseId) {
          navigate(`/courses/${courseId}/edit`);
        } else {
          navigate("/courses");
        }
      } catch (error) {
        console.error("Error updating lesson:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update lesson. Please try again.",
        });
      }
    },
    [lesson, lessonId, courseId, updateLessonMutation, navigate, toast]
  );

  // Handle Quiz lesson form submission
  const handleQuizLessonSubmit = useCallback(
    async (data: QuizLessonFormData) => {
      if (!lesson) return;

      const content = {
        title: data.quizTitle || "",
        instructions: data.instructions || "",
        timeLimit: data.timeLimit || undefined,
        passingScore: data.passingScore,
        questions: data.questions,
      };

      const durationMinutes = data.timeLimit
        ? Math.ceil(data.timeLimit / 60)
        : calculateQuizDuration(data.questions);

      const updateData: UpdateLessonInput = {
        title: data.title,
        content: JSON.stringify(content),
        durationMinutes: durationMinutes,
      };

      try {
        await updateLessonMutation.mutateAsync({
          id: lessonId,
          data: updateData,
        });

        toast({
          title: "Lesson Updated",
          description: `"${data.title}" has been updated successfully.`,
        });

        if (courseId) {
          navigate(`/courses/${courseId}/edit`);
        } else {
          navigate("/courses");
        }
      } catch (error) {
        console.error("Error updating lesson:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update lesson. Please try again.",
        });
      }
    },
    [lesson, lessonId, courseId, updateLessonMutation, navigate, toast]
  );

  // Handle Speaking lesson form submission
  const handleSpeakingLessonSubmit = useCallback(
    async (data: SpeakingLessonFormData) => {
      if (!lesson) return;

      const content = {
        scenario: data.scenario,
        difficulty: data.difficulty,
        prompts: data.prompts,
        rolePlaySettings: data.rolePlaySettings || undefined,
      };

      const durationMinutes = calculateSpeakingDuration(
        data.prompts,
        data.rolePlaySettings?.turns
      );

      const updateData: UpdateLessonInput = {
        title: data.title,
        content: JSON.stringify(content),
        durationMinutes: durationMinutes,
      };

      try {
        await updateLessonMutation.mutateAsync({
          id: lessonId,
          data: updateData,
        });

        toast({
          title: "Lesson Updated",
          description: `"${data.title}" has been updated successfully.`,
        });

        if (courseId) {
          navigate(`/courses/${courseId}/edit`);
        } else {
          navigate("/courses");
        }
      } catch (error) {
        console.error("Error updating lesson:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update lesson. Please try again.",
        });
      }
    },
    [lesson, lessonId, courseId, updateLessonMutation, navigate, toast]
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (courseId) {
      navigate(`/courses/${courseId}/edit`);
    } else {
      navigate("/courses");
    }
  }, [courseId, navigate]);

  // Loading state
  if (isLoading || isLoadingContext) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state - lesson not found
  if (error || !lesson) {
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
                Lesson Not Found
              </CardTitle>
            </div>
            <CardDescription className="text-destructive/80">
              The lesson you're trying to edit doesn't exist or has been
              deleted.
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
          {section && (
            <>
              <BreadcrumbItem>
                <span className="text-muted-foreground">{section.title}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Lesson</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Render appropriate editor based on lesson type */}
      {lesson.lessonType === "READING" && (
        <ReadingLessonEditor
          initialData={getReadingInitialData()}
          onSubmit={handleReadingLessonSubmit}
          onBack={handleBack}
          isSubmitting={updateLessonMutation.isPending}
          submitLabel="Save Changes"
        />
      )}

      {lesson.lessonType === "LISTENING" && (
        <ListeningLessonEditor
          initialData={getListeningInitialData()}
          onSubmit={handleListeningLessonSubmit}
          onBack={handleBack}
          isSubmitting={updateLessonMutation.isPending}
          submitLabel="Save Changes"
        />
      )}

      {lesson.lessonType === "QUIZ" && (
        <QuizLessonEditor
          initialData={getQuizInitialData()}
          onSubmit={handleQuizLessonSubmit}
          onBack={handleBack}
          isSubmitting={updateLessonMutation.isPending}
          submitLabel="Save Changes"
        />
      )}

      {lesson.lessonType === "SPEAKING" && (
        <SpeakingLessonEditor
          initialData={getSpeakingInitialData()}
          onSubmit={handleSpeakingLessonSubmit}
          onBack={handleBack}
          isSubmitting={updateLessonMutation.isPending}
          submitLabel="Save Changes"
        />
      )}

      {/* Unsupported lesson type fallback */}
      {!["READING", "LISTENING", "QUIZ", "SPEAKING"].includes(
        lesson.lessonType
      ) && (
        <Card>
          <CardHeader>
            <CardTitle>Unsupported Lesson Type</CardTitle>
            <CardDescription>
              Editing for {lesson.lessonType} lessons is not yet supported.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
