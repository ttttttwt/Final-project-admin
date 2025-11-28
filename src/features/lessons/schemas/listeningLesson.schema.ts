/**
 * Listening Lesson Validation Schema
 * Zod schemas for validating Listening lesson content
 */

import { z } from "zod";

/**
 * Question types for listening lessons
 */
export const listeningQuestionTypeSchema = z.enum([
  "multiple_choice",
  "true_false",
  "fill_blank",
]);

/**
 * Listening question schema with optional timestamp
 */
export const listeningQuestionSchema = z
  .object({
    question: z
      .string()
      .min(1, "Question text is required")
      .max(1000, "Question must not exceed 1,000 characters"),
    type: listeningQuestionTypeSchema,
    options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
    correctAnswer: z.union([z.string(), z.number()]),
    explanation: z
      .string()
      .max(1000, "Explanation must not exceed 1,000 characters")
      .optional(),
    timestamp: z.number().min(0, "Timestamp must be 0 or greater").optional(),
  })
  .refine(
    (data) => {
      if (data.type === "multiple_choice") {
        return (
          data.options && data.options.length >= 2 && data.options.length <= 6
        );
      }
      return true;
    },
    {
      message: "Multiple choice questions must have 2-6 options",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "multiple_choice" && data.options) {
        const answerIndex =
          typeof data.correctAnswer === "number"
            ? data.correctAnswer
            : parseInt(data.correctAnswer as string, 10);
        return (
          !isNaN(answerIndex) &&
          answerIndex >= 0 &&
          answerIndex < data.options.length
        );
      }
      return true;
    },
    {
      message: "Correct answer must be a valid option index",
      path: ["correctAnswer"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "true_false") {
        const answer = String(data.correctAnswer).toLowerCase();
        return answer === "true" || answer === "false";
      }
      return true;
    },
    {
      message: "True/false answer must be 'true' or 'false'",
      path: ["correctAnswer"],
    }
  );

/**
 * Part of speech options
 */
export const partOfSpeechSchema = z.enum([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun",
  "interjection",
]);

/**
 * Vocabulary item schema with optional timestamp for listening lessons
 */
export const listeningVocabularyItemSchema = z.object({
  word: z
    .string()
    .min(1, "Word is required")
    .max(100, "Word must not exceed 100 characters"),
  definition: z
    .string()
    .min(1, "Definition is required")
    .max(500, "Definition must not exceed 500 characters"),
  example: z
    .string()
    .max(500, "Example must not exceed 500 characters")
    .optional(),
  partOfSpeech: partOfSpeechSchema.optional(),
  timestamp: z.number().min(0, "Timestamp must be 0 or greater").optional(),
});

/**
 * Audio URL validation
 */
const audioUrlSchema = z
  .string()
  .min(1, "Audio URL is required")
  .refine(
    (url) => {
      // Allow relative paths (starting with /) or valid URLs
      if (url.startsWith("/")) return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid URL format" }
  );

/**
 * Complete Listening lesson content schema
 */
export const listeningLessonContentSchema = z.object({
  audioUrl: audioUrlSchema,
  duration: z
    .number()
    .min(1, "Duration must be at least 1 second")
    .max(3600, "Duration cannot exceed 1 hour (3600 seconds)"),
  transcript: z
    .string()
    .min(1, "Transcript is required for accessibility")
    .max(50000, "Transcript must not exceed 50,000 characters"),
  showTranscript: z.boolean().default(false),
  questions: z
    .array(listeningQuestionSchema)
    .min(1, "At least one question is required")
    .max(50, "Maximum 50 questions allowed"),
  vocabulary: z
    .array(listeningVocabularyItemSchema)
    .max(50, "Maximum 50 vocabulary items allowed")
    .optional(),
});

/**
 * Complete Listening lesson form schema (includes lesson metadata)
 */
export const listeningLessonFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must not exceed 200 characters"),
    description: z
      .string()
      .max(1000, "Description must not exceed 1,000 characters")
      .optional(),
    audioUrl: audioUrlSchema,
    duration: z
      .number()
      .min(1, "Duration must be at least 1 second")
      .max(3600, "Duration cannot exceed 1 hour (3600 seconds)"),
    transcript: z
      .string()
      .min(1, "Transcript is required for accessibility")
      .max(50000, "Transcript must not exceed 50,000 characters"),
    showTranscript: z.boolean(),
    questions: z
      .array(listeningQuestionSchema)
      .min(1, "At least one question is required")
      .max(50, "Maximum 50 questions allowed"),
    vocabulary: z
      .array(listeningVocabularyItemSchema)
      .max(50, "Maximum 50 vocabulary items allowed")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validate that timestamps don't exceed duration
    data.questions.forEach((q, idx) => {
      if (q.timestamp !== undefined && q.timestamp > data.duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Timestamp (${q.timestamp}s) cannot exceed audio duration (${data.duration}s)`,
          path: ["questions", idx, "timestamp"],
        });
      }
    });

    data.vocabulary?.forEach((v, idx) => {
      if (v.timestamp !== undefined && v.timestamp > data.duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Timestamp (${v.timestamp}s) cannot exceed audio duration (${data.duration}s)`,
          path: ["vocabulary", idx, "timestamp"],
        });
      }
    });
  });

/**
 * Type exports from schema
 */
export type ListeningQuestionFormData = z.infer<typeof listeningQuestionSchema>;
export type ListeningVocabularyItemFormData = z.infer<
  typeof listeningVocabularyItemSchema
>;
export type ListeningLessonContentFormData = z.infer<
  typeof listeningLessonContentSchema
>;
export type ListeningLessonFormData = z.infer<typeof listeningLessonFormSchema>;

/**
 * Default values for new items
 */
export const defaultListeningQuestion: ListeningQuestionFormData = {
  question: "",
  type: "multiple_choice",
  options: ["", ""],
  correctAnswer: 0,
  explanation: "",
  timestamp: undefined,
};

export const defaultListeningVocabularyItem: ListeningVocabularyItemFormData = {
  word: "",
  definition: "",
  example: "",
  partOfSpeech: undefined,
  timestamp: undefined,
};

export const defaultListeningContent: ListeningLessonContentFormData = {
  audioUrl: "",
  duration: 0,
  transcript: "",
  showTranscript: false,
  questions: [{ ...defaultListeningQuestion }],
  vocabulary: [],
};
