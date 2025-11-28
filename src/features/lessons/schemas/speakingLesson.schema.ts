/**
 * Speaking Lesson Validation Schema
 * Zod schemas for validating Speaking lesson content
 */

import { z } from "zod";

/**
 * Difficulty levels for speaking lessons
 */
export const speakingDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

/**
 * Speaking prompt schema
 */
export const speakingPromptSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt text is required")
    .max(1000, "Prompt must not exceed 1,000 characters"),
  context: z
    .string()
    .max(500, "Context must not exceed 500 characters")
    .optional(),
  sampleAnswers: z
    .array(z.string().min(1, "Sample answer cannot be empty"))
    .max(5, "Maximum 5 sample answers")
    .optional(),
  targetGrammar: z
    .array(z.string().min(1, "Grammar point cannot be empty"))
    .max(10, "Maximum 10 grammar points")
    .optional(),
  targetVocabulary: z
    .array(z.string().min(1, "Vocabulary item cannot be empty"))
    .max(20, "Maximum 20 vocabulary items")
    .optional(),
});

/**
 * Role-play settings schema
 */
export const rolePlaySettingsSchema = z.object({
  aiPersona: z
    .string()
    .max(200, "AI persona must not exceed 200 characters")
    .optional(),
  turns: z
    .number()
    .min(1, "Turns must be at least 1")
    .max(20, "Turns cannot exceed 20")
    .optional(),
  enableFeedback: z.boolean().optional(),
});

/**
 * Complete Speaking lesson content schema
 */
export const speakingLessonContentSchema = z.object({
  scenario: z
    .string()
    .min(1, "Scenario description is required")
    .max(2000, "Scenario must not exceed 2,000 characters"),
  difficulty: speakingDifficultySchema,
  prompts: z
    .array(speakingPromptSchema)
    .min(1, "At least one prompt is required")
    .max(20, "Maximum 20 prompts allowed"),
  rolePlaySettings: rolePlaySettingsSchema.optional(),
});

/**
 * Complete Speaking lesson form schema (includes lesson metadata)
 */
export const speakingLessonFormSchema = z.object({
  title: z
    .string()
    .min(1, "Lesson title is required")
    .max(200, "Lesson title must not exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1,000 characters")
    .optional(),
  scenario: z
    .string()
    .min(1, "Scenario description is required")
    .max(2000, "Scenario must not exceed 2,000 characters"),
  difficulty: speakingDifficultySchema,
  prompts: z
    .array(speakingPromptSchema)
    .min(1, "At least one prompt is required")
    .max(20, "Maximum 20 prompts allowed"),
  rolePlaySettings: rolePlaySettingsSchema.optional(),
});

/**
 * Type exports from schema
 */
export type SpeakingDifficulty = z.infer<typeof speakingDifficultySchema>;
export type SpeakingPromptFormData = z.infer<typeof speakingPromptSchema>;
export type RolePlaySettingsFormData = z.infer<typeof rolePlaySettingsSchema>;
export type SpeakingLessonContentFormData = z.infer<
  typeof speakingLessonContentSchema
>;
export type SpeakingLessonFormData = z.infer<typeof speakingLessonFormSchema>;

/**
 * Default values for new items
 */
export const defaultSpeakingPrompt: SpeakingPromptFormData = {
  prompt: "",
  context: "",
  sampleAnswers: [],
  targetGrammar: [],
  targetVocabulary: [],
};

export const defaultRolePlaySettings: RolePlaySettingsFormData = {
  aiPersona: "",
  turns: 5,
  enableFeedback: true,
};

export const defaultSpeakingContent: SpeakingLessonContentFormData = {
  scenario: "",
  difficulty: "beginner",
  prompts: [{ ...defaultSpeakingPrompt }],
  rolePlaySettings: { ...defaultRolePlaySettings },
};

/**
 * Helper function to calculate speaking lesson duration
 * ~2-3 minutes per prompt for practice
 */
export function calculateSpeakingDuration(
  prompts: SpeakingPromptFormData[],
  turns?: number
): number {
  // Base time: 2 minutes per prompt
  const promptMinutes = prompts.length * 2;

  // If role-play is enabled, add time for turns
  const rolePlayMinutes = turns ? Math.ceil(turns * 1.5) : 0;

  return Math.max(5, promptMinutes + rolePlayMinutes);
}

/**
 * Difficulty labels for UI
 */
export const difficultyLabels: Record<SpeakingDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * Difficulty colors for UI badges
 */
export const difficultyColors: Record<
  SpeakingDifficulty,
  "default" | "secondary" | "destructive"
> = {
  beginner: "default",
  intermediate: "secondary",
  advanced: "destructive",
};
