/**
 * Reading Lesson Editor Component
 * Main editor for creating/editing READING type lessons
 * Manages passages, questions, and vocabulary with validation
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  BookOpen,
  HelpCircle,
  BookText,
  Save,
  ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

import { PassageEditor } from "./PassageEditor";
import { QuestionEditor } from "./QuestionEditor";
import { VocabularyEditor } from "./VocabularyEditor";
import {
  readingLessonFormSchema,
  type ReadingLessonFormData,
  type PassageFormData,
  type ReadingQuestionFormData,
  type VocabularyItemFormData,
  defaultPassage,
  defaultQuestion,
  defaultVocabularyItem,
} from "../schemas/readingLesson.schema";

interface ReadingLessonEditorProps {
  /** Initial data for editing (optional) */
  initialData?: Partial<ReadingLessonFormData>;
  /** Callback when form is submitted */
  onSubmit: (data: ReadingLessonFormData) => void;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Submit button text */
  submitLabel?: string;
}

/**
 * ReadingLessonEditor - Complete editor for READING lessons
 */
export function ReadingLessonEditor({
  initialData,
  onSubmit,
  onBack,
  isSubmitting = false,
  submitLabel = "Create Lesson",
}: ReadingLessonEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReadingLessonFormData>({
    resolver: zodResolver(readingLessonFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      passages: initialData?.passages || [{ ...defaultPassage }],
      questions: initialData?.questions || [{ ...defaultQuestion }],
      vocabulary: initialData?.vocabulary || [],
    },
  });

  // Watch form values for live updates
  const passages = watch("passages");
  const questions = watch("questions");
  const vocabulary = watch("vocabulary");
  const title = watch("title");

  // === Passage Handlers ===
  const handlePassageChange = useCallback(
    (index: number, passage: PassageFormData) => {
      const newPassages = [...passages];
      newPassages[index] = passage;
      setValue("passages", newPassages, { shouldValidate: true });
    },
    [passages, setValue]
  );

  const handleAddPassage = useCallback(() => {
    setValue("passages", [...passages, { ...defaultPassage }], {
      shouldValidate: true,
    });
  }, [passages, setValue]);

  const handleDeletePassage = useCallback(
    (index: number) => {
      const newPassages = passages.filter(
        (_: PassageFormData, i: number) => i !== index
      );
      setValue("passages", newPassages, { shouldValidate: true });
    },
    [passages, setValue]
  );

  // === Question Handlers ===
  const handleQuestionChange = useCallback(
    (index: number, question: ReadingQuestionFormData) => {
      const newQuestions = [...questions];
      newQuestions[index] = question;
      setValue("questions", newQuestions, { shouldValidate: true });
    },
    [questions, setValue]
  );

  const handleAddQuestion = useCallback(() => {
    setValue("questions", [...questions, { ...defaultQuestion }], {
      shouldValidate: true,
    });
  }, [questions, setValue]);

  const handleDeleteQuestion = useCallback(
    (index: number) => {
      const newQuestions = questions.filter(
        (_: ReadingQuestionFormData, i: number) => i !== index
      );
      setValue("questions", newQuestions, { shouldValidate: true });
    },
    [questions, setValue]
  );

  // === Vocabulary Handlers ===
  const handleVocabularyChange = useCallback(
    (index: number, item: VocabularyItemFormData) => {
      const newVocabulary = [...(vocabulary || [])];
      newVocabulary[index] = item;
      setValue("vocabulary", newVocabulary, { shouldValidate: true });
    },
    [vocabulary, setValue]
  );

  const handleAddVocabulary = useCallback(() => {
    setValue(
      "vocabulary",
      [...(vocabulary || []), { ...defaultVocabularyItem }],
      {
        shouldValidate: true,
      }
    );
  }, [vocabulary, setValue]);

  const handleDeleteVocabulary = useCallback(
    (index: number) => {
      const newVocabulary = (vocabulary || []).filter(
        (_: VocabularyItemFormData, i: number) => i !== index
      );
      setValue("vocabulary", newVocabulary, { shouldValidate: true });
    },
    [vocabulary, setValue]
  );

  // Get error counts for tab badges
  const passageErrors = errors.passages?.length || 0;
  const questionErrors = errors.questions?.length || 0;
  const basicErrors = (errors.title ? 1 : 0) + (errors.description ? 1 : 0);

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
              {title || "New Reading Lesson"}
            </h1>
            <p className="text-muted-foreground">
              Configure your reading lesson content
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="relative">
            Basic Info
            {basicErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {basicErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="passages" className="relative">
            <BookOpen className="h-4 w-4 mr-2" />
            Passages ({passages.length})
            {passageErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {passageErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="questions" className="relative">
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions ({questions.length})
            {questionErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {questionErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vocabulary">
            <BookText className="h-4 w-4 mr-2" />
            Vocabulary ({vocabulary?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>
                Basic information about this reading lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
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
                  placeholder="Brief description of what learners will read and learn..."
                  rows={3}
                  maxLength={1000}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passages Tab */}
        <TabsContent value="passages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Reading Passages</h3>
              <p className="text-sm text-muted-foreground">
                Add one or more passages for learners to read
              </p>
            </div>
            <Button type="button" onClick={handleAddPassage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Passage
            </Button>
          </div>

          {errors.passages && !Array.isArray(errors.passages) && (
            <p className="text-sm text-destructive">
              {errors.passages.message}
            </p>
          )}

          <div className="space-y-4">
            {passages.map((passage: PassageFormData, index: number) => (
              <PassageEditor
                key={index}
                passage={passage}
                index={index + 1}
                isOnly={passages.length === 1}
                onChange={(p) => handlePassageChange(index, p)}
                onDelete={() => handleDeletePassage(index)}
                errors={{
                  title: errors.passages?.[index]?.title?.message,
                  text: errors.passages?.[index]?.text?.message,
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Comprehension Questions</h3>
              <p className="text-sm text-muted-foreground">
                Add questions to test reading comprehension
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
            {questions.map(
              (question: ReadingQuestionFormData, index: number) => (
                <QuestionEditor
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
                  }}
                />
              )
            )}
          </div>
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Vocabulary List</h3>
              <p className="text-sm text-muted-foreground">
                Define key vocabulary words from the passages (optional)
              </p>
            </div>
            <Button type="button" onClick={handleAddVocabulary}>
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
          </div>

          {!vocabulary || vocabulary.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <BookText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No vocabulary words yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add vocabulary words to help learners understand key terms
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVocabulary}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Word
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vocabulary.map((item: VocabularyItemFormData, index: number) => (
                <VocabularyEditor
                  key={index}
                  item={item}
                  index={index + 1}
                  onChange={(v) => handleVocabularyChange(index, v)}
                  onDelete={() => handleDeleteVocabulary(index)}
                  errors={{
                    word: errors.vocabulary?.[index]?.word?.message,
                    definition: errors.vocabulary?.[index]?.definition?.message,
                  }}
                />
              ))}
            </div>
          )}
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
            {passages.length} passage{passages.length !== 1 && "s"},{" "}
            {questions.length} question{questions.length !== 1 && "s"},{" "}
            {vocabulary?.length || 0} vocabulary word
            {(vocabulary?.length || 0) !== 1 && "s"}
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

export default ReadingLessonEditor;
