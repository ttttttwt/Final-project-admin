/**
 * Courses Feature Module
 * Exports all course-related components, hooks, and types
 */

// Pages
export { default as CourseListPage } from "./pages/CourseListPage";
export { default as CourseCreatePage } from "./pages/CourseCreatePage";
export { default as CourseEditPage } from "./pages/CourseEditPage";
export { default as CoursePreviewPage } from "./pages/CoursePreviewPage";

// Components
export { CourseTable } from "./components/CourseTable";
export { CourseForm } from "./components/CourseForm";

// Hooks
export {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  usePublishCourse,
  useUnpublishCourse,
  courseKeys,
} from "./hooks/useCourses";

// API
export { coursesApi } from "./api/coursesApi";

// Types
export type {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CourseSearchParams,
  CEFRLevel,
} from "./types/course.types";
