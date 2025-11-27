/**
 * Course Hooks
 * TanStack Query hooks for course management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../api/coursesApi";
import type {
  CourseSearchParams,
  CreateCourseInput,
  UpdateCourseInput,
} from "../types/course.types";

/** Query key factory for courses */
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (params: CourseSearchParams) =>
    [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated courses with filters
 */
export const useCourses = (params: CourseSearchParams) => {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () =>
      coursesApi.getCourses(
        params.page,
        params.size,
        params.title,
        params.cefrLevel,
        params.isPublished,
        params.sort
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single course by ID
 */
export const useCourse = (id: number) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => coursesApi.getCourse(id),
    enabled: !!id && id > 0,
  });
};

/**
 * Hook to create a new course
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseInput) => coursesApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing course
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseInput }) =>
      coursesApi.updateCourse(id, data),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(updatedCourse.id),
      });
    },
  });
};

/**
 * Hook to delete a course
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => coursesApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

/**
 * Hook to publish a course
 */
export const usePublishCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => coursesApi.publishCourse(id),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(updatedCourse.id),
      });
    },
  });
};

/**
 * Hook to unpublish a course
 */
export const useUnpublishCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => coursesApi.unpublishCourse(id),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(updatedCourse.id),
      });
    },
  });
};
