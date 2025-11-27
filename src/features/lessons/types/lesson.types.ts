/**
 * Lesson Types
 * Type definitions for lesson management
 */

/** Lesson type enum matching backend LessonType */
export type LessonType = "READING" | "LISTENING" | "QUIZ" | "SPEAKING";

/** Lesson type metadata for UI display */
export interface LessonTypeInfo {
  type: LessonType;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
}

/** All available lesson types with their metadata */
export const LESSON_TYPES: LessonTypeInfo[] = [
  {
    type: "READING",
    title: "Reading",
    description:
      "Text-based reading comprehension exercises with passages, questions, and vocabulary.",
    icon: "BookOpen",
    color: "bg-blue-500",
  },
  {
    type: "LISTENING",
    title: "Listening",
    description:
      "Audio-based listening comprehension with transcripts and timed questions.",
    icon: "Headphones",
    color: "bg-purple-500",
  },
  {
    type: "QUIZ",
    title: "Quiz",
    description:
      "Standalone assessment with multiple question types, time limits, and scoring.",
    icon: "ClipboardCheck",
    color: "bg-green-500",
  },
  {
    type: "SPEAKING",
    title: "Speaking",
    description:
      "Speaking practice prompts with AI role-play scenarios and feedback.",
    icon: "Mic",
    color: "bg-orange-500",
  },
];

/** Lesson data returned from API */
export interface Lesson {
  id: number;
  sectionId: number;
  title: string;
  lessonType: LessonType;
  content: string; // JSONB content as string
  orderIndex: number;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a new lesson */
export interface CreateLessonInput {
  title: string;
  lessonType: LessonType;
  content: string; // JSONB content as string
  orderIndex: number;
  durationMinutes: number;
}

/** Request body for creating a lesson (matches API) */
export interface CreateLessonRequest {
  sectionId: number;
  title: string;
  description?: string;
  type: LessonType;
  content: Record<string, unknown>;
  orderIndex: number;
  estimatedMinutes?: number;
}

/** Request body for updating a lesson (matches API) */
export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  type?: LessonType;
  content?: Record<string, unknown>;
  orderIndex?: number;
  estimatedMinutes?: number;
}

/** Input for updating an existing lesson */
export interface UpdateLessonInput {
  title?: string;
  lessonType?: LessonType;
  content?: string;
  orderIndex?: number;
  durationMinutes?: number;
}

// ============================================
// Content Types for JSONB validation
// ============================================

/** Base question interface */
export interface BaseQuestion {
  question: string;
  type:
    | "multiple_choice"
    | "true_false"
    | "short_answer"
    | "fill_blank"
    | "matching";
  options?: string[];
  correctAnswer: string | number | string[];
  explanation?: string;
}

/** Reading lesson question */
export interface ReadingQuestion extends BaseQuestion {
  type: "multiple_choice" | "true_false" | "short_answer";
}

/** Listening lesson question with optional timestamp */
export interface ListeningQuestion extends BaseQuestion {
  type: "multiple_choice" | "true_false" | "fill_blank";
  timestamp?: number;
}

/** Quiz lesson question with points and hint */
export interface QuizQuestion extends BaseQuestion {
  type: "multiple_choice" | "true_false" | "fill_blank" | "matching";
  points?: number;
  hint?: string;
}

/** Vocabulary item */
export interface VocabularyItem {
  word: string;
  definition: string;
  example?: string;
  partOfSpeech?: string;
  timestamp?: number; // For listening lessons
}

/** Passage for reading lessons */
export interface Passage {
  text: string;
  title?: string;
}

/** Speaking prompt */
export interface SpeakingPrompt {
  prompt: string;
  context?: string;
  sampleAnswers?: string[];
  targetGrammar?: string[];
  targetVocabulary?: string[];
}

/** Role-play settings for speaking lessons */
export interface RolePlaySettings {
  aiPersona?: string;
  turns?: number;
  enableFeedback?: boolean;
}

// ============================================
// Content Schemas by Lesson Type
// ============================================

/** READING lesson content schema */
export interface ReadingLessonContent {
  passages: Passage[];
  questions: ReadingQuestion[];
  vocabulary?: VocabularyItem[];
}

/** LISTENING lesson content schema */
export interface ListeningLessonContent {
  audioUrl: string;
  duration: number;
  transcript: string;
  showTranscript?: boolean;
  questions: ListeningQuestion[];
  vocabulary?: VocabularyItem[];
}

/** QUIZ lesson content schema */
export interface QuizLessonContent {
  title?: string;
  instructions?: string;
  timeLimit?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

/** SPEAKING lesson content schema */
export interface SpeakingLessonContent {
  scenario: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompts: SpeakingPrompt[];
  rolePlaySettings?: RolePlaySettings;
}

/** Union type for all lesson content */
export type LessonContent =
  | ReadingLessonContent
  | ListeningLessonContent
  | QuizLessonContent
  | SpeakingLessonContent;
