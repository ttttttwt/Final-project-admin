/**
 * Reading Lesson Validation Schema
 * Zod schemas for validating Reading lesson content
 */

import { z } from "zod";

/**
 * Passage schema
 */
export const passageSchema = z.object({
  title: z.string().max(255, "Title must not exceed 255 characters").optional(),
  text: z
    .string()
    .min(1, "Passage text is required")
    .max(10000, "Passage text must not exceed 10,000 characters"),
});

/**
 * Reading question types
 */
export const questionTypeSchema = z.enum([
  "multiple_choice",
  "true_false",
  "short_answer",
]);

/**
 * Reading question schema
 */
export const readingQuestionSchema = z
  .object({
    question: z
      .string()
      .min(1, "Question text is required")
      .max(1000, "Question must not exceed 1,000 characters"),
    type: questionTypeSchema,
    options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
    correctAnswer: z.union([z.string(), z.number()]),
    explanation: z
      .string()
      .max(1000, "Explanation must not exceed 1,000 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // Multiple choice must have 2-6 options
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
      // Correct answer must be valid index for multiple choice
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
      // True/false must have true or false as answer
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
 * Vocabulary item schema
 */
export const vocabularyItemSchema = z.object({
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
});

/**
 * Complete Reading lesson content schema
 */
export const readingLessonContentSchema = z.object({
  passages: z
    .array(passageSchema)
    .min(1, "At least one passage is required")
    .max(10, "Maximum 10 passages allowed"),
  questions: z
    .array(readingQuestionSchema)
    .min(1, "At least one question is required")
    .max(50, "Maximum 50 questions allowed"),
  vocabulary: z
    .array(vocabularyItemSchema)
    .max(50, "Maximum 50 vocabulary items allowed")
    .optional(),
});

/**
 * Complete Reading lesson form schema (includes lesson metadata)
 */
export const readingLessonFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1,000 characters")
    .optional(),
  passages: z
    .array(passageSchema)
    .min(1, "At least one passage is required")
    .max(10, "Maximum 10 passages allowed"),
  questions: z
    .array(readingQuestionSchema)
    .min(1, "At least one question is required")
    .max(50, "Maximum 50 questions allowed"),
  vocabulary: z
    .array(vocabularyItemSchema)
    .max(50, "Maximum 50 vocabulary items allowed")
    .optional(),
});

/**
 * Type exports from schema
 */
export type PassageFormData = z.infer<typeof passageSchema>;
export type ReadingQuestionFormData = z.infer<typeof readingQuestionSchema>;
export type VocabularyItemFormData = z.infer<typeof vocabularyItemSchema>;
export type ReadingLessonContentFormData = z.infer<
  typeof readingLessonContentSchema
>;
export type ReadingLessonFormData = z.infer<typeof readingLessonFormSchema>;

/**
 * Default values for new items
 */
export const defaultPassage: PassageFormData = {
  title: "",
  text: "",
};

export const defaultQuestion: ReadingQuestionFormData = {
  question: "",
  type: "multiple_choice",
  options: ["", ""],
  correctAnswer: 0,
  explanation: "",
};

export const defaultVocabularyItem: VocabularyItemFormData = {
  word: "",
  definition: "",
  example: "",
  partOfSpeech: undefined,
};

export const defaultReadingContent: ReadingLessonContentFormData = {
  passages: [{ ...defaultPassage }],
  questions: [{ ...defaultQuestion }],
  vocabulary: [],
};
