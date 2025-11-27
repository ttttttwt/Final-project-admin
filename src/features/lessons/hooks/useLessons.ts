/**
 * Lesson Hooks
 * TanStack Query hooks for lesson operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsApi } from "../api/lessonsApi";
import type {
  CreateLessonInput,
  UpdateLessonInput,
} from "../types/lesson.types";
import { useToast } from "@/hooks/use-toast";

// Query keys
export const lessonKeys = {
  all: ["lessons"] as const,
  lists: () => [...lessonKeys.all, "list"] as const,
  list: (filters: { sectionId?: number; courseId?: number }) =>
    [...lessonKeys.lists(), filters] as const,
  details: () => [...lessonKeys.all, "detail"] as const,
  detail: (id: number) => [...lessonKeys.details(), id] as const,
};

/**
 * Hook to fetch a single lesson by ID
 */
export const useLesson = (id: number) => {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: () => lessonsApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch all lessons for a section
 */
export const useLessonsBySection = (sectionId: number) => {
  return useQuery({
    queryKey: lessonKeys.list({ sectionId }),
    queryFn: () => lessonsApi.getBySectionId(sectionId),
    enabled: !!sectionId && sectionId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch all lessons for a course
 */
export const useLessonsByCourse = (courseId: number) => {
  return useQuery({
    queryKey: lessonKeys.list({ courseId }),
    queryFn: () => lessonsApi.getByCourseId(courseId),
    enabled: !!courseId && courseId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a new lesson
 */
export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: number;
      data: CreateLessonInput;
    }) => lessonsApi.create(sectionId, data),
    onSuccess: (lesson) => {
      // Invalidate section lessons
      queryClient.invalidateQueries({
        queryKey: lessonKeys.list({ sectionId: lesson.sectionId }),
      });
      // Invalidate all lessons lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      // Invalidate sections query to update lesson count
      queryClient.invalidateQueries({ queryKey: ["sections"] });

      toast({
        title: "Lesson created",
        description: `"${lesson.title}" has been created successfully.`,
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to create lesson";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook to update an existing lesson
 */
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLessonInput }) =>
      lessonsApi.update(id, data),
    onSuccess: (lesson) => {
      // Update cache for this lesson
      queryClient.setQueryData(lessonKeys.detail(lesson.id), lesson);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });

      toast({
        title: "Lesson updated",
        description: `"${lesson.title}" has been updated successfully.`,
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to update lesson";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook to delete a lesson
 */
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => lessonsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: lessonKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      // Invalidate sections query to update lesson count
      queryClient.invalidateQueries({ queryKey: ["sections"] });

      toast({
        title: "Lesson deleted",
        description: "The lesson has been deleted successfully.",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to delete lesson";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook to reorder a lesson
 */
export const useReorderLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      newOrderIndex,
    }: {
      id: number;
      newOrderIndex: number;
    }) => lessonsApi.reorder(id, newOrderIndex),
    onSuccess: (lesson) => {
      // Update cache for this lesson
      queryClient.setQueryData(lessonKeys.detail(lesson.id), lesson);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });

      toast({
        title: "Lesson reordered",
        description: "The lesson order has been updated.",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to reorder lesson";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });
};
