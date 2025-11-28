/**
 * Quiz Lesson Validation Schema
 * Zod schemas for validating Quiz lesson content
 */

import { z } from "zod";

/**
 * Question types for quiz lessons
 */
export const quizQuestionTypeSchema = z.enum([
  "multiple_choice",
  "true_false",
  "fill_blank",
  "matching",
]);

/**
 * Quiz question schema with points and hint
 */
export const quizQuestionSchema = z
  .object({
    question: z
      .string()
      .min(1, "Question text is required")
      .max(1000, "Question must not exceed 1,000 characters"),
    type: quizQuestionTypeSchema,
    options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
    correctAnswer: z.union([z.string(), z.number(), z.array(z.string())]),
    points: z
      .number()
      .min(1, "Points must be at least 1")
      .max(100, "Points cannot exceed 100")
      .default(1),
    explanation: z
      .string()
      .max(1000, "Explanation must not exceed 1,000 characters")
      .optional(),
    hint: z.string().max(500, "Hint must not exceed 500 characters").optional(),
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
  )
  .refine(
    (data) => {
      // Matching must have matching pairs (even number of options)
      if (data.type === "matching") {
        return (
          data.options &&
          data.options.length >= 4 &&
          data.options.length % 2 === 0
        );
      }
      return true;
    },
    {
      message: "Matching questions must have at least 2 pairs (4 options)",
      path: ["options"],
    }
  );

/**
 * Complete Quiz lesson content schema
 */
export const quizLessonContentSchema = z.object({
  title: z
    .string()
    .max(255, "Quiz title must not exceed 255 characters")
    .optional(),
  instructions: z
    .string()
    .max(2000, "Instructions must not exceed 2,000 characters")
    .optional(),
  timeLimit: z
    .number()
    .min(30, "Time limit must be at least 30 seconds")
    .max(7200, "Time limit cannot exceed 2 hours (7200 seconds)")
    .optional(),
  passingScore: z
    .number()
    .min(0, "Passing score must be 0 or greater")
    .max(100, "Passing score cannot exceed 100")
    .default(70),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "At least one question is required")
    .max(100, "Maximum 100 questions allowed"),
});

/**
 * Complete Quiz lesson form schema (includes lesson metadata)
 */
export const quizLessonFormSchema = z.object({
  title: z
    .string()
    .min(1, "Lesson title is required")
    .max(200, "Lesson title must not exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1,000 characters")
    .optional(),
  quizTitle: z
    .string()
    .max(255, "Quiz title must not exceed 255 characters")
    .optional(),
  instructions: z
    .string()
    .max(2000, "Instructions must not exceed 2,000 characters")
    .optional(),
  timeLimit: z
    .number()
    .min(30, "Time limit must be at least 30 seconds")
    .max(7200, "Time limit cannot exceed 2 hours (7200 seconds)")
    .optional()
    .nullable(),
  passingScore: z
    .number()
    .min(0, "Passing score must be 0 or greater")
    .max(100, "Passing score cannot exceed 100"),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "At least one question is required")
    .max(100, "Maximum 100 questions allowed"),
});

/**
 * Type exports from schema
 */
export type QuizQuestionType = z.infer<typeof quizQuestionTypeSchema>;
export type QuizQuestionFormData = z.infer<typeof quizQuestionSchema>;
export type QuizLessonContentFormData = z.infer<typeof quizLessonContentSchema>;
export type QuizLessonFormData = z.infer<typeof quizLessonFormSchema>;

/**
 * Default values for new items
 */
export const defaultQuizQuestion: QuizQuestionFormData = {
  question: "",
  type: "multiple_choice",
  options: ["", ""],
  correctAnswer: 0,
  points: 1,
  explanation: "",
  hint: "",
};

export const defaultQuizContent: QuizLessonContentFormData = {
  title: "",
  instructions: "",
  timeLimit: undefined,
  passingScore: 70,
  questions: [{ ...defaultQuizQuestion }],
};

/**
 * Helper function to calculate total points
 */
export function calculateTotalPoints(
  questions: QuizQuestionFormData[]
): number {
  return questions.reduce((total, q) => total + (q.points || 1), 0);
}

/**
 * Helper function to calculate quiz duration estimate
 * ~30 seconds per multiple choice question
 * ~45 seconds per fill blank question
 * ~60 seconds per matching question
 */
export function calculateQuizDuration(
  questions: QuizQuestionFormData[]
): number {
  let totalSeconds = 0;

  for (const q of questions) {
    switch (q.type) {
      case "multiple_choice":
      case "true_false":
        totalSeconds += 30;
        break;
      case "fill_blank":
        totalSeconds += 45;
        break;
      case "matching":
        totalSeconds += 60;
        break;
      default:
        totalSeconds += 30;
    }
  }

  // Return duration in minutes (minimum 1)
  return Math.max(1, Math.ceil(totalSeconds / 60));
}
