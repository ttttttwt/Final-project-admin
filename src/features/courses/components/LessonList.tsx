/**
 * Lesson List Component
 * Displays lessons within a section with drag-and-drop reordering
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  BookOpen,
  Headphones,
  ClipboardCheck,
  Mic,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useLessonsBySection,
  useDeleteLesson,
  useReorderLesson,
} from "../../lessons/hooks/useLessons";
import { LessonPreviewDialog } from "../../lessons/components/LessonPreviewDialog";
import type { Lesson, LessonType } from "../../lessons/types/lesson.types";

interface LessonListProps {
  /** Section ID to load lessons for */
  sectionId: number;
  /** Course ID for navigation */
  courseId: number;
  /** Callback when add lesson button is clicked */
  onAddLesson?: (sectionId: number) => void;
}

/** Get icon component for lesson type */
const getLessonTypeIcon = (type: LessonType) => {
  switch (type) {
    case "READING":
      return <BookOpen className="h-4 w-4" />;
    case "LISTENING":
      return <Headphones className="h-4 w-4" />;
    case "QUIZ":
      return <ClipboardCheck className="h-4 w-4" />;
    case "SPEAKING":
      return <Mic className="h-4 w-4" />;
  }
};

/** Get color class for lesson type badge */
const getLessonTypeColor = (type: LessonType): string => {
  switch (type) {
    case "READING":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "LISTENING":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "QUIZ":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "SPEAKING":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
};

/**
 * LessonList - Component for displaying and managing lessons in a section
 */
export function LessonList({
  sectionId,
  courseId,
  onAddLesson,
}: LessonListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Queries and mutations
  const { data: lessons, isLoading, error } = useLessonsBySection(sectionId);
  const deleteLesson = useDeleteLesson();
  const reorderLesson = useReorderLesson();

  // Handlers
  const handleEdit = useCallback(
    (lesson: Lesson) => {
      navigate(`/lessons/${lesson.id}/edit?courseId=${courseId}`);
    },
    [navigate, courseId]
  );

  const handlePreview = useCallback((lesson: Lesson) => {
    setPreviewLesson(lesson);
  }, []);

  const handleDeleteClick = useCallback((lesson: Lesson) => {
    setDeletingLesson(lesson);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingLesson) return;

    try {
      await deleteLesson.mutateAsync(deletingLesson.id);
      setDeletingLesson(null);
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  }, [deletingLesson, deleteLesson]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      setDragOverIndex(null);

      if (draggedIndex === null || draggedIndex === dropIndex || !lessons) {
        setDraggedIndex(null);
        return;
      }

      const draggedLesson = lessons[draggedIndex];

      try {
        await reorderLesson.mutateAsync({
          id: draggedLesson.id,
          newOrderIndex: dropIndex,
        });
      } catch (error) {
        console.error("Error reordering lesson:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to reorder lesson. Please try again.",
        });
      }

      setDraggedIndex(null);
    },
    [draggedIndex, lessons, reorderLesson, toast]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading lessons...
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-sm text-destructive text-center py-4">
        Failed to load lessons. Please try again.
      </div>
    );
  }

  // Empty state
  if (!lessons || lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          No lessons in this section yet.
        </p>
        {onAddLesson && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLesson(sectionId)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add First Lesson
          </Button>
        )}
      </div>
    );
  }

  // Sort lessons by orderIndex
  const sortedLessons = [...lessons].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <>
      <div className="space-y-2">
        {sortedLessons.length > 1 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <GripVertical className="h-3 w-3" />
            Drag lessons to reorder
          </p>
        )}
        {sortedLessons.map((lesson, index) => (
          <div
            key={lesson.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border bg-background/50 transition-all",
              draggedIndex === index && "opacity-50 ring-2 ring-primary",
              dragOverIndex === index && "border-t-2 border-primary"
            )}
          >
            {/* Drag Handle */}
            <button
              type="button"
              className="cursor-grab p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label="Drag to reorder lesson"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Lesson Type Icon */}
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                getLessonTypeColor(lesson.lessonType)
              )}
            >
              {getLessonTypeIcon(lesson.lessonType)}
            </div>

            {/* Lesson Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {lesson.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {lesson.lessonType}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lesson.durationMinutes} min
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePreview(lesson)}
                aria-label={`Preview lesson: ${lesson.title}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(lesson)}
                aria-label={`Edit lesson: ${lesson.title}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteClick(lesson)}
                aria-label={`Delete lesson: ${lesson.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Lesson Button */}
        {onAddLesson && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onAddLesson(sectionId)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Lesson
          </Button>
        )}
      </div>

      {/* Preview Dialog */}
      <LessonPreviewDialog
        open={!!previewLesson}
        onOpenChange={(open) => !open && setPreviewLesson(null)}
        lesson={previewLesson}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingLesson}
        onOpenChange={(open) => !open && setDeletingLesson(null)}
        title="Delete Lesson"
        description={
          deletingLesson
            ? `Are you sure you want to delete "${deletingLesson.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        isLoading={deleteLesson.isPending}
      />
    </>
  );
}

export default LessonList;
