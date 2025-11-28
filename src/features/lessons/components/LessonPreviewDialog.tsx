/**
 * Lesson Preview Dialog Component
 * Displays a preview of lesson content in a dialog/modal
 * Supports all 4 lesson types: READING, LISTENING, QUIZ, SPEAKING
 */

import {
  BookOpen,
  Headphones,
  ClipboardCheck,
  Mic,
  Clock,
  FileText,
  HelpCircle,
  BookText,
  Volume2,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type {
  Lesson,
  LessonType,
  ReadingLessonContent,
  ListeningLessonContent,
  QuizLessonContent,
  SpeakingLessonContent,
} from "../types/lesson.types";

interface LessonPreviewDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The lesson to preview */
  lesson: Lesson | null;
}

/** Get icon component for lesson type */
const getLessonTypeIcon = (type: LessonType) => {
  switch (type) {
    case "READING":
      return <BookOpen className="h-5 w-5" />;
    case "LISTENING":
      return <Headphones className="h-5 w-5" />;
    case "QUIZ":
      return <ClipboardCheck className="h-5 w-5" />;
    case "SPEAKING":
      return <Mic className="h-5 w-5" />;
  }
};

/** Get color class for lesson type */
const getLessonTypeColor = (type: LessonType): string => {
  switch (type) {
    case "READING":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "LISTENING":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "QUIZ":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "SPEAKING":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
  }
};

/** Reading Lesson Preview */
function ReadingLessonPreview({ content }: { content: ReadingLessonContent }) {
  return (
    <Tabs defaultValue="passages" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="passages">
          <FileText className="h-4 w-4 mr-2" />
          Passages ({content.passages?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="questions">
          <HelpCircle className="h-4 w-4 mr-2" />
          Questions ({content.questions?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="vocabulary">
          <BookText className="h-4 w-4 mr-2" />
          Vocabulary ({content.vocabulary?.length || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="passages"
        className="mt-4 space-y-4 max-h-[400px] overflow-y-auto"
      >
        {content.passages?.map((passage, index) => (
          <Card key={index}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                {passage.title || `Passage ${index + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {passage.text}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!content.passages || content.passages.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No passages added yet.
          </p>
        )}
      </TabsContent>

      <TabsContent
        value="questions"
        className="mt-4 space-y-4 max-h-[400px] overflow-y-auto"
      >
        {content.questions?.map((question, index) => (
          <Card key={index}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <p className="font-medium">
                    {question.question ||
                      (question as { text?: string }).text ||
                      "Question"}
                  </p>
                  {question.type && (
                    <Badge variant="outline" className="text-xs">
                      {String(question.type).replace("_", " ")}
                    </Badge>
                  )}
                  {question.type === "multiple_choice" && question.options && (
                    <div className="space-y-1 mt-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 text-sm p-2 rounded ${
                            question.correctAnswer === optIndex
                              ? "bg-green-50 dark:bg-green-900/20"
                              : ""
                          }`}
                        >
                          {question.correctAnswer === optIndex ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === "true_false" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Correct answer:{" "}
                      <span className="font-medium text-green-600">
                        {question.correctAnswer === "true" ||
                        question.correctAnswer === 0
                          ? "True"
                          : "False"}
                      </span>
                    </p>
                  )}
                  {question.type === "short_answer" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Expected answer:{" "}
                      <span className="font-medium">
                        {String(question.correctAnswer)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!content.questions || content.questions.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No questions added yet.
          </p>
        )}
      </TabsContent>

      <TabsContent
        value="vocabulary"
        className="mt-4 max-h-[400px] overflow-y-auto"
      >
        {content.vocabulary && content.vocabulary.length > 0 ? (
          <div className="grid gap-3">
            {content.vocabulary.map((vocab, index) => (
              <Card key={index}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{vocab.word}</span>
                      {vocab.partOfSpeech && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({vocab.partOfSpeech})
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {vocab.definition}
                      </p>
                      {vocab.example && (
                        <p className="text-sm italic text-muted-foreground mt-1">
                          Example: "{vocab.example}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No vocabulary words added yet.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

/** Listening Lesson Preview */
function ListeningLessonPreview({
  content,
}: {
  content: ListeningLessonContent;
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Audio Section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 space-y-3">
          {content.audioUrl ? (
            <>
              <audio controls className="w-full" src={content.audioUrl}>
                Your browser does not support the audio element.
              </audio>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Duration: {formatDuration(content.duration || 0)}</span>
                <Badge variant="outline">
                  {content.showTranscript
                    ? "Transcript visible"
                    : "Transcript hidden"}
                </Badge>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No audio URL provided.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transcript */}
      {content.transcript && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Transcript</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[150px] overflow-y-auto">
              {content.transcript}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Questions ({content.questions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 space-y-3 max-h-[200px] overflow-y-auto">
          {content.questions?.map((question, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{question.question}</p>
                {question.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    at {formatDuration(question.timestamp)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {(!content.questions || content.questions.length === 0) && (
            <p className="text-sm text-muted-foreground text-center">
              No questions added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Quiz Lesson Preview */
function QuizLessonPreview({ content }: { content: QuizLessonContent }) {
  const totalPoints =
    content.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Quiz Settings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {content.title && (
              <div>
                <span className="text-muted-foreground">Title: </span>
                <span className="font-medium">{content.title}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Passing Score: </span>
              <span className="font-medium">{content.passingScore || 70}%</span>
            </div>
            {content.timeLimit && (
              <div>
                <span className="text-muted-foreground">Time Limit: </span>
                <span className="font-medium">
                  {Math.floor(content.timeLimit / 60)} minutes
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Total Points: </span>
              <span className="font-medium">{totalPoints}</span>
            </div>
          </div>
          {content.instructions && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {content.instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Questions ({content.questions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 space-y-3 max-h-[300px] overflow-y-auto">
          {content.questions?.map((question, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium">
                    {question.question ||
                      (question as { text?: string }).text ||
                      "Question"}
                  </p>
                </div>
                <Badge variant="secondary">{question.points || 1} pt</Badge>
              </div>
              <div className="pl-9">
                {question.type && (
                  <Badge variant="outline" className="text-xs">
                    {String(question.type).replace("_", " ")}
                  </Badge>
                )}
                {question.hint && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Hint: {question.hint}
                  </p>
                )}
              </div>
            </div>
          ))}
          {(!content.questions || content.questions.length === 0) && (
            <p className="text-sm text-muted-foreground text-center">
              No questions added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Speaking Lesson Preview */
function SpeakingLessonPreview({
  content,
}: {
  content: SpeakingLessonContent;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Scenario */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Scenario</CardTitle>
            <Badge className={getDifficultyColor(content.difficulty)}>
              {content.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-3">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {content.scenario}
          </p>
        </CardContent>
      </Card>

      {/* Role-Play Settings */}
      {content.rolePlaySettings && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Role-Play Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {content.rolePlaySettings.aiPersona && (
                <div>
                  <span className="text-muted-foreground">AI Persona: </span>
                  <span className="font-medium">
                    {content.rolePlaySettings.aiPersona}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Turns: </span>
                <span className="font-medium">
                  {content.rolePlaySettings.turns || 5}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Feedback: </span>
                <span className="font-medium">
                  {content.rolePlaySettings.enableFeedback !== false
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompts */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Speaking Prompts ({content.prompts?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 space-y-3 max-h-[250px] overflow-y-auto">
          {content.prompts?.map((prompt, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{prompt.prompt}</p>
                  {prompt.context && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Context: {prompt.context}
                    </p>
                  )}
                  {prompt.sampleAnswers && prompt.sampleAnswers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Sample answers:
                      </p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground">
                        {prompt.sampleAnswers.slice(0, 2).map((answer, i) => (
                          <li key={i}>{answer}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!content.prompts || content.prompts.length === 0) && (
            <p className="text-sm text-muted-foreground text-center">
              No speaking prompts added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * LessonPreviewDialog - Main component for previewing lessons
 */
export function LessonPreviewDialog({
  open,
  onOpenChange,
  lesson,
}: LessonPreviewDialogProps) {
  if (!lesson) return null;

  // Parse lesson content from JSON string
  let parsedContent:
    | ReadingLessonContent
    | ListeningLessonContent
    | QuizLessonContent
    | SpeakingLessonContent
    | null = null;
  try {
    parsedContent =
      typeof lesson.content === "string"
        ? JSON.parse(lesson.content)
        : lesson.content;
  } catch (error) {
    console.error("Failed to parse lesson content:", error);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${getLessonTypeColor(
                lesson.lessonType
              )}`}
            >
              {getLessonTypeIcon(lesson.lessonType)}
            </div>
            <div>
              <DialogTitle>{lesson.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-3 mt-1">
                <Badge variant="outline">{lesson.lessonType}</Badge>
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {lesson.durationMinutes} min
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {parsedContent ? (
          <>
            {lesson.lessonType === "READING" && (
              <ReadingLessonPreview
                content={parsedContent as ReadingLessonContent}
              />
            )}
            {lesson.lessonType === "LISTENING" && (
              <ListeningLessonPreview
                content={parsedContent as ListeningLessonContent}
              />
            )}
            {lesson.lessonType === "QUIZ" && (
              <QuizLessonPreview content={parsedContent as QuizLessonContent} />
            )}
            {lesson.lessonType === "SPEAKING" && (
              <SpeakingLessonPreview
                content={parsedContent as SpeakingLessonContent}
              />
            )}
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Unable to load lesson content.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LessonPreviewDialog;
