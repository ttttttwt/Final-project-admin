/**
 * Course Form Component
 * Form for creating and editing courses
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CEFRLevel,
} from "../types/course.types";

/** CEFR Level values for validation */
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/** Zod validation schema for course form */
const courseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must not exceed 255 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  cefrLevel: z.enum(CEFR_LEVELS, {
    message: "Please select a CEFR level",
  }),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  /** Existing course data for editing */
  initialData?: Course;
  /** Callback when form is submitted */
  onSubmit: (data: CreateCourseInput | UpdateCourseInput) => void;
  /** Whether form submission is in progress */
  isLoading?: boolean;
  /** Callback when cancel button is clicked */
  onCancel?: () => void;
}

/** CEFR level options with descriptions */
const cefrLevels: { value: CEFRLevel; label: string; description: string }[] = [
  {
    value: "A1",
    label: "A1 - Beginner",
    description: "Basic phrases and expressions",
  },
  {
    value: "A2",
    label: "A2 - Elementary",
    description: "Simple everyday situations",
  },
  {
    value: "B1",
    label: "B1 - Intermediate",
    description: "Main points of clear standard input",
  },
  {
    value: "B2",
    label: "B2 - Upper Intermediate",
    description: "Complex texts and abstract topics",
  },
  {
    value: "C1",
    label: "C1 - Advanced",
    description: "Demanding texts and implicit meaning",
  },
  {
    value: "C2",
    label: "C2 - Proficiency",
    description: "Near-native fluency",
  },
];

/**
 * CourseForm - Form component for creating and editing courses
 */
export function CourseForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: CourseFormProps) {
  const isEditing = !!initialData;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      cefrLevel: initialData?.cefrLevel || undefined,
    },
  });

  // Reset form when initialData changes (e.g., when data is loaded)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        cefrLevel: initialData.cefrLevel,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: CourseFormValues) => {
    // Clean up empty optional fields
    const cleanedData: CreateCourseInput | UpdateCourseInput = {
      title: values.title,
      cefrLevel: values.cefrLevel as CEFRLevel,
    };

    if (values.description && values.description.trim()) {
      cleanedData.description = values.description.trim();
    }

    onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter course title"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                A descriptive title for your course (max 255 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  placeholder="Enter course description"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Detailed description of what learners will achieve (max 1000
                characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CEFR Level */}
        <FormField
          control={form.control}
          name="cefrLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEFR Level *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a CEFR level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cefrLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex flex-col">
                        <span>{level.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {level.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Common European Framework of Reference language level
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Course"
              : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
