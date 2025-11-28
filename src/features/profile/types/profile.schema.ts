import { z } from "zod";

/**
 * Validation schema for profile update form
 * Backend uses firstName and lastName instead of fullName
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .max(20, "Phone number must be at most 20 characters")
    .optional()
    .or(z.literal("")),
  timezone: z
    .string()
    .max(50, "Timezone must be at most 50 characters")
    .optional()
    .or(z.literal("")),
  language: z
    .string()
    .max(10, "Language must be at most 10 characters")
    .optional()
    .or(z.literal("")),
  currentLevel: z
    .enum([
      "BEGINNER",
      "ELEMENTARY",
      "INTERMEDIATE",
      "UPPER_INTERMEDIATE",
      "ADVANCED",
      "PROFICIENT",
      "",
    ])
    .optional(),
  learningGoal: z
    .string()
    .max(500, "Learning goal must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

/**
 * Validation schema for password change form
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
