/**
 * Quiz Lesson Editor Component
 * Main editor for creating/editing QUIZ type lessons
 * Manages quiz settings and questions with validation
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  ClipboardCheck,
  HelpCircle,
  Settings,
  Save,
  ChevronLeft,
  Clock,
  Award,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { QuizQuestionEditor } from "./QuizQuestionEditor";
import {
  quizLessonFormSchema,
  type QuizLessonFormData,
  type QuizQuestionFormData,
  defaultQuizQuestion,
  calculateTotalPoints,
} from "../schemas/quizLesson.schema";

interface QuizLessonEditorProps {
  /** Initial data for editing (optional) */
  initialData?: Partial<QuizLessonFormData>;
  /** Callback when form is submitted */
  onSubmit: (data: QuizLessonFormData) => void;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Submit button text */
  submitLabel?: string;
}

/**
 * Format seconds to human-readable time
 */
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0)
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * QuizLessonEditor - Complete editor for QUIZ lessons
 */
export function QuizLessonEditor({
  initialData,
  onSubmit,
  onBack,
  isSubmitting = false,
  submitLabel = "Create Lesson",
}: QuizLessonEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [hasTimeLimit, setHasTimeLimit] = useState(!!initialData?.timeLimit);

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizLessonFormData>({
    resolver: zodResolver(quizLessonFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      quizTitle: initialData?.quizTitle || "",
      instructions: initialData?.instructions || "",
      timeLimit: initialData?.timeLimit || null,
      passingScore: initialData?.passingScore ?? 70,
      questions: initialData?.questions || [{ ...defaultQuizQuestion }],
    },
  });

  // Watch form values for live updates
  const questions = watch("questions");
  const title = watch("title");
  const timeLimit = watch("timeLimit");
  const passingScore = watch("passingScore");

  // Calculate stats
  const totalPoints = calculateTotalPoints(questions);
  const questionCount = questions.length;

  // === Question Handlers ===
  const handleQuestionChange = useCallback(
    (index: number, question: QuizQuestionFormData) => {
      const newQuestions = [...questions];
      newQuestions[index] = question;
      setValue("questions", newQuestions, { shouldValidate: true });
    },
    [questions, setValue]
  );

  const handleAddQuestion = useCallback(() => {
    setValue("questions", [...questions, { ...defaultQuizQuestion }], {
      shouldValidate: true,
    });
  }, [questions, setValue]);

  const handleDeleteQuestion = useCallback(
    (index: number) => {
      const newQuestions = questions.filter(
        (_: QuizQuestionFormData, i: number) => i !== index
      );
      setValue("questions", newQuestions, { shouldValidate: true });
    },
    [questions, setValue]
  );

  // Handle time limit toggle
  const handleTimeLimitToggle = useCallback(
    (enabled: boolean) => {
      setHasTimeLimit(enabled);
      if (!enabled) {
        setValue("timeLimit", null, { shouldValidate: true });
      } else {
        setValue("timeLimit", 600, { shouldValidate: true }); // Default 10 minutes
      }
    },
    [setValue]
  );

  // Get error counts for tab badges
  const questionErrors = errors.questions?.length || 0;
  const basicErrors =
    (errors.title ? 1 : 0) +
    (errors.description ? 1 : 0) +
    (errors.quizTitle ? 1 : 0);
  const settingsErrors =
    (errors.timeLimit ? 1 : 0) +
    (errors.passingScore ? 1 : 0) +
    (errors.instructions ? 1 : 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {title || "New Quiz Lesson"}
            </h1>
            <p className="text-muted-foreground">
              Configure your quiz lesson with questions and settings
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>

      <Separator />

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Questions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{questionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total Points
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Passing Score
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{passingScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time Limit</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {timeLimit ? formatTime(timeLimit) : "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="relative">
            Basic Info
            {basicErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {basicErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="relative">
            <Settings className="h-4 w-4 mr-2" />
            Quiz Settings
            {settingsErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {settingsErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="questions" className="relative">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Questions ({questions.length})
            {questionErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {questionErrors}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>
                Basic information about this quiz lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lesson Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Lesson Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter lesson title..."
                  maxLength={200}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This title will be displayed in the course outline.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of what this quiz assesses..."
                  rows={3}
                  maxLength={1000}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Quiz Title (Internal) */}
              <div className="space-y-2">
                <Label htmlFor="quizTitle">
                  Quiz Title{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="quizTitle"
                  {...register("quizTitle")}
                  placeholder="e.g., Present Perfect Tense Quiz"
                  maxLength={255}
                />
                {errors.quizTitle && (
                  <p className="text-sm text-destructive">
                    {errors.quizTitle.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Displayed at the top of the quiz when learners start.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>
                Configure time limits, passing scores, and instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Instructions{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="instructions"
                  {...register("instructions")}
                  placeholder="Enter any special instructions for learners..."
                  rows={4}
                  maxLength={2000}
                />
                {errors.instructions && (
                  <p className="text-sm text-destructive">
                    {errors.instructions.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Displayed before the quiz begins. Use this for special rules
                  or tips.
                </p>
              </div>

              {/* Time Limit */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timeLimit-toggle">Time Limit</Label>
                    <p className="text-sm text-muted-foreground">
                      Set a maximum time for completing the quiz
                    </p>
                  </div>
                  <Switch
                    id="timeLimit-toggle"
                    checked={hasTimeLimit}
                    onCheckedChange={handleTimeLimitToggle}
                  />
                </div>

                {hasTimeLimit && (
                  <div className="space-y-2 pl-4 border-l-2">
                    <Label htmlFor="timeLimit">
                      Time Limit (seconds){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="timeLimit"
                        type="number"
                        min={30}
                        max={7200}
                        {...register("timeLimit", { valueAsNumber: true })}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        {timeLimit && formatTime(timeLimit)}
                      </span>
                    </div>
                    {errors.timeLimit && (
                      <p className="text-sm text-destructive">
                        {errors.timeLimit.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Between 30 seconds and 2 hours (7200 seconds)
                    </p>
                  </div>
                )}
              </div>

              {/* Passing Score */}
              <div className="space-y-2">
                <Label htmlFor="passingScore">
                  Passing Score (%) <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="passingScore"
                    type="number"
                    min={0}
                    max={100}
                    {...register("passingScore", { valueAsNumber: true })}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {totalPoints > 0 && (
                      <>
                        Minimum {Math.ceil((passingScore / 100) * totalPoints)}{" "}
                        of {totalPoints} points
                      </>
                    )}
                  </span>
                </div>
                {errors.passingScore && (
                  <p className="text-sm text-destructive">
                    {errors.passingScore.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Learners need to score at least this percentage to pass.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Quiz Questions</h3>
              <p className="text-sm text-muted-foreground">
                Add questions with points, hints, and explanations
              </p>
            </div>
            <Button type="button" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {errors.questions && !Array.isArray(errors.questions) && (
            <p className="text-sm text-destructive">
              {errors.questions.message}
            </p>
          )}

          <div className="space-y-4">
            {questions.map((question: QuizQuestionFormData, index: number) => (
              <QuizQuestionEditor
                key={index}
                question={question}
                index={index + 1}
                isOnly={questions.length === 1}
                onChange={(q) => handleQuestionChange(index, q)}
                onDelete={() => handleDeleteQuestion(index)}
                errors={{
                  question: errors.questions?.[index]?.question?.message,
                  type: errors.questions?.[index]?.type?.message,
                  options: errors.questions?.[index]?.options?.message,
                  correctAnswer:
                    errors.questions?.[index]?.correctAnswer?.message,
                  points: errors.questions?.[index]?.points?.message,
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {questionCount} question{questionCount !== 1 && "s"}, {totalPoints}{" "}
            total point{totalPoints !== 1 && "s"}, {passingScore}% passing score
          </span>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default QuizLessonEditor;
