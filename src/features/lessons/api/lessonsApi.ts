/**
 * Lessons API
 * API functions for lesson management
 */

import api from "@/lib/api";
import type {
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
} from "../types/lesson.types";
import type { Section } from "@/features/courses/types/course.types";

export const lessonsApi = {
  /**
   * Get lesson by ID
   */
  getById: async (id: number): Promise<Lesson> => {
    const response = await api.get<Lesson>(`/lessons/${id}`);
    return response.data;
  },

  /**
   * Get all lessons for a section
   */
  getBySectionId: async (sectionId: number): Promise<Lesson[]> => {
    const response = await api.get<Lesson[]>(`/lessons/sections/${sectionId}`);
    return response.data;
  },

  /**
   * Get all lessons for a course (across all sections)
   */
  getByCourseId: async (courseId: number): Promise<Lesson[]> => {
    const response = await api.get<Lesson[]>(`/lessons/courses/${courseId}`);
    return response.data;
  },

  /**
   * Create a new lesson within a section
   */
  create: async (
    sectionId: number,
    data: CreateLessonInput
  ): Promise<Lesson> => {
    const response = await api.post<Lesson>(
      `/lessons/sections/${sectionId}/lessons`,
      data
    );
    return response.data;
  },

  /**
   * Update an existing lesson
   */
  update: async (id: number, data: UpdateLessonInput): Promise<Lesson> => {
    const response = await api.put<Lesson>(`/lessons/${id}`, data);
    return response.data;
  },

  /**
   * Delete a lesson
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/lessons/${id}`);
  },

  /**
   * Reorder a lesson within its section
   */
  reorder: async (id: number, newOrderIndex: number): Promise<Lesson> => {
    const response = await api.patch<Lesson>(`/lessons/${id}/reorder`, null, {
      params: { newOrderIndex },
    });
    return response.data;
  },

  /**
   * Get section by ID (via course sections endpoint)
   * Used to validate sectionId parameter
   */
  getSectionById: async (
    courseId: number,
    sectionId: number
  ): Promise<Section> => {
    const response = await api.get<Section>(
      `/courses/${courseId}/sections/${sectionId}`
    );
    return response.data;
  },

  /**
   * Get section info by fetching all sections for a course and finding the one
   * This is a workaround since we don't have a direct section endpoint
   */
  getSectionInfo: async (sectionId: number): Promise<Section | null> => {
    // Try to find the section by fetching lessons for this section
    // The lessons endpoint will return 404 if section doesn't exist
    try {
      const lessons = await api.get<Lesson[]>(`/lessons/sections/${sectionId}`);
      // If we got here, section exists. Get first lesson to get sectionId context
      if (lessons.data.length > 0) {
        // We know section exists, but we need more info
        // For now, return a minimal section object
        return null;
      }
      return null;
    } catch {
      return null;
    }
  },
};
