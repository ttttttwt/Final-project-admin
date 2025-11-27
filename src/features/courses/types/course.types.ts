/**
 * Course Types
 * Type definitions for course management
 */

/** CEFR Level enum */
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Course search parameters */
export interface CourseSearchParams {
  page: number;
  size: number;
  title?: string;
  cefrLevel?: CEFRLevel;
  isPublished?: boolean;
  sort?: string;
}

/** Course data returned from API */
export interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  cefrLevel: CEFRLevel;
  isPublished: boolean;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a new course */
export interface CreateCourseInput {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  cefrLevel: CEFRLevel;
}

/** Input for updating an existing course */
export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  cefrLevel?: CEFRLevel;
  isPublished?: boolean;
}

// ============================================
// Section Types
// ============================================

/** Section data returned from API */
export interface Section {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  lessonCount: number;
  createdAt: string;
}

/** Input for creating a new section */
export interface CreateSectionInput {
  title: string;
  orderIndex?: number;
}

/** Input for updating an existing section */
export interface UpdateSectionInput {
  title?: string;
  orderIndex?: number;
}

/** Input for reordering sections */
export interface ReorderSectionsInput {
  sectionIds: number[];
}
