/**
 * Courses API
 * API functions for course management
 */

import api from "@/lib/api";
import type { Page } from "@/types/api.types";
import type {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
} from "../types/course.types";

export const coursesApi = {
  /**
   * Get paginated list of courses with search and filters
   */
  getCourses: async (
    page = 0,
    size = 10,
    title?: string,
    cefrLevel?: string,
    isPublished?: boolean,
    sort = "createdAt,desc"
  ): Promise<Page<Course>> => {
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      size,
      sort,
    };

    // Add optional filters
    if (title) params.title = title;
    if (cefrLevel) params.cefrLevel = cefrLevel;
    if (isPublished !== undefined) params.isPublished = isPublished;

    const response = await api.get<Page<Course>>("/courses/search", { params });
    return response.data;
  },

  /**
   * Get a single course by ID
   */
  getCourse: async (id: number): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${id}`);
    return response.data;
  },

  /**
   * Create a new course
   */
  createCourse: async (data: CreateCourseInput): Promise<Course> => {
    const response = await api.post<Course>("/courses", data);
    return response.data;
  },

  /**
   * Update an existing course
   */
  updateCourse: async (
    id: number,
    data: UpdateCourseInput
  ): Promise<Course> => {
    const response = await api.put<Course>(`/courses/${id}`, data);
    return response.data;
  },

  /**
   * Delete a course
   */
  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },

  /**
   * Publish a course
   */
  publishCourse: async (id: number): Promise<Course> => {
    const response = await api.post<Course>(`/courses/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublish a course
   */
  unpublishCourse: async (id: number): Promise<Course> => {
    const response = await api.post<Course>(`/courses/${id}/unpublish`);
    return response.data;
  },

  /**
   * Upload course thumbnail image
   * @param id Course ID
   * @param file Image file (JPG, PNG, WebP, max 5MB)
   */
  uploadThumbnail: async (id: number, file: File): Promise<Course> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<Course>(
      `/courses/${id}/thumbnail`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete course thumbnail image
   */
  deleteThumbnail: async (id: number): Promise<Course> => {
    const response = await api.delete<Course>(`/courses/${id}/thumbnail`);
    return response.data;
  },
};
