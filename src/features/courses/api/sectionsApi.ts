/**
 * Sections API
 * API functions for section management within courses
 */

import api from "@/lib/api";
import type {
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  ReorderSectionsInput,
} from "../types/course.types";

export const sectionsApi = {
  /**
   * Get all sections for a course
   */
  getSections: async (courseId: number): Promise<Section[]> => {
    const response = await api.get<Section[]>(`/courses/${courseId}/sections`);
    return response.data;
  },

  /**
   * Get a single section by ID
   */
  getSection: async (courseId: number, sectionId: number): Promise<Section> => {
    const response = await api.get<Section>(
      `/courses/${courseId}/sections/${sectionId}`
    );
    return response.data;
  },

  /**
   * Create a new section within a course
   */
  createSection: async (
    courseId: number,
    data: CreateSectionInput
  ): Promise<Section> => {
    const response = await api.post<Section>(
      `/courses/${courseId}/sections`,
      data
    );
    return response.data;
  },

  /**
   * Update an existing section
   */
  updateSection: async (
    courseId: number,
    sectionId: number,
    data: UpdateSectionInput
  ): Promise<Section> => {
    const response = await api.put<Section>(
      `/courses/${courseId}/sections/${sectionId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a section
   */
  deleteSection: async (courseId: number, sectionId: number): Promise<void> => {
    await api.delete(`/courses/${courseId}/sections/${sectionId}`);
  },

  /**
   * Reorder sections within a course
   */
  reorderSections: async (
    courseId: number,
    data: ReorderSectionsInput
  ): Promise<Section[]> => {
    const response = await api.post<Section[]>(
      `/courses/${courseId}/sections/reorder`,
      data
    );
    return response.data;
  },
};
