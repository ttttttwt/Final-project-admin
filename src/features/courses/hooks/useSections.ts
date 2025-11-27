/**
 * Section Hooks
 * TanStack Query hooks for section management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "../api/sectionsApi";
import type {
  CreateSectionInput,
  UpdateSectionInput,
  ReorderSectionsInput,
} from "../types/course.types";
import { courseKeys } from "./useCourses";

/** Query key factory for sections */
export const sectionKeys = {
  all: ["sections"] as const,
  lists: () => [...sectionKeys.all, "list"] as const,
  list: (courseId: number) => [...sectionKeys.lists(), courseId] as const,
  details: () => [...sectionKeys.all, "detail"] as const,
  detail: (courseId: number, sectionId: number) =>
    [...sectionKeys.details(), courseId, sectionId] as const,
};

/**
 * Hook to fetch all sections for a course
 */
export const useSections = (courseId: number) => {
  return useQuery({
    queryKey: sectionKeys.list(courseId),
    queryFn: () => sectionsApi.getSections(courseId),
    enabled: !!courseId && courseId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single section by ID
 */
export const useSection = (courseId: number, sectionId: number) => {
  return useQuery({
    queryKey: sectionKeys.detail(courseId, sectionId),
    queryFn: () => sectionsApi.getSection(courseId, sectionId),
    enabled: !!courseId && courseId > 0 && !!sectionId && sectionId > 0,
  });
};

/**
 * Hook to create a new section
 */
export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: CreateSectionInput;
    }) => sectionsApi.createSection(courseId, data),
    onSuccess: (_, variables) => {
      // Invalidate sections list for the course
      queryClient.invalidateQueries({
        queryKey: sectionKeys.list(variables.courseId),
      });
      // Also invalidate course detail to update sectionCount
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseKeys.lists(),
      });
    },
  });
};

/**
 * Hook to update an existing section
 */
export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      data,
    }: {
      courseId: number;
      sectionId: number;
      data: UpdateSectionInput;
    }) => sectionsApi.updateSection(courseId, sectionId, data),
    onSuccess: (updatedSection, variables) => {
      // Invalidate sections list
      queryClient.invalidateQueries({
        queryKey: sectionKeys.list(variables.courseId),
      });
      // Update the specific section cache
      queryClient.setQueryData(
        sectionKeys.detail(variables.courseId, variables.sectionId),
        updatedSection
      );
    },
  });
};

/**
 * Hook to delete a section
 */
export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
    }: {
      courseId: number;
      sectionId: number;
    }) => sectionsApi.deleteSection(courseId, sectionId),
    onSuccess: (_, variables) => {
      // Invalidate sections list
      queryClient.invalidateQueries({
        queryKey: sectionKeys.list(variables.courseId),
      });
      // Remove the specific section from cache
      queryClient.removeQueries({
        queryKey: sectionKeys.detail(variables.courseId, variables.sectionId),
      });
      // Also invalidate course detail to update sectionCount
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseKeys.lists(),
      });
    },
  });
};

/**
 * Hook to reorder sections within a course
 */
export const useReorderSections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: ReorderSectionsInput;
    }) => sectionsApi.reorderSections(courseId, data),
    onSuccess: (reorderedSections, variables) => {
      // Update sections list with new order
      queryClient.setQueryData(
        sectionKeys.list(variables.courseId),
        reorderedSections
      );
    },
  });
};
