/**
 * Section Manager Component
 * Manages sections within a course (CRUD operations)
 */

import { useState, useCallback } from "react";
import { Plus, Loader2, AlertCircle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { SectionForm } from "./SectionForm";
import { SectionItem } from "./SectionItem";
import {
  useSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
} from "../hooks/useSections";
import type { Section, CreateSectionInput } from "../types/course.types";

interface SectionManagerProps {
  /** Course ID */
  courseId: number;
  /** Callback when a lesson should be added to a section */
  onAddLesson?: (sectionId: number) => void;
}

type FormMode = "hidden" | "create" | "edit";

/**
 * SectionManager - Main component for managing course sections
 */
export function SectionManager({ courseId, onAddLesson }: SectionManagerProps) {
  const { toast } = useToast();

  // State
  const [formMode, setFormMode] = useState<FormMode>("hidden");
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Queries and mutations
  const { data: sections, isLoading, error, refetch } = useSections(courseId);
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const reorderSections = useReorderSections();

  // Handlers
  const handleAddClick = useCallback(() => {
    setFormMode("create");
    setEditingSection(null);
  }, []);

  const handleEditClick = useCallback((section: Section) => {
    setFormMode("edit");
    setEditingSection(section);
  }, []);

  const handleDeleteClick = useCallback((section: Section) => {
    setDeletingSection(section);
  }, []);

  const handleFormCancel = useCallback(() => {
    setFormMode("hidden");
    setEditingSection(null);
  }, []);

  const handleCreateSubmit = useCallback(
    async (data: CreateSectionInput) => {
      try {
        await createSection.mutateAsync({ courseId, data });
        toast({
          title: "Section created",
          description: `"${data.title}" has been added to the course.`,
        });
        setFormMode("hidden");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Failed to create section";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    },
    [courseId, createSection, toast]
  );

  const handleUpdateSubmit = useCallback(
    async (data: CreateSectionInput) => {
      if (!editingSection) return;

      try {
        await updateSection.mutateAsync({
          courseId,
          sectionId: editingSection.id,
          data: { title: data.title },
        });
        toast({
          title: "Section updated",
          description: `"${data.title}" has been updated.`,
        });
        setFormMode("hidden");
        setEditingSection(null);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Failed to update section";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    },
    [courseId, editingSection, updateSection, toast]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingSection) return;

    try {
      await deleteSection.mutateAsync({
        courseId,
        sectionId: deletingSection.id,
      });
      toast({
        title: "Section deleted",
        description: `"${deletingSection.title}" and its lessons have been deleted.`,
      });
      setDeletingSection(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to delete section";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  }, [courseId, deletingSection, deleteSection, toast]);

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

      if (draggedIndex === null || draggedIndex === dropIndex || !sections) {
        setDraggedIndex(null);
        return;
      }

      // Create new order
      const newOrder = [...sections];
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(dropIndex, 0, draggedItem);

      const sectionIds = newOrder.map((s) => s.id);

      try {
        await reorderSections.mutateAsync({ courseId, data: { sectionIds } });
        toast({
          title: "Sections reordered",
          description: "The section order has been updated.",
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Failed to reorder sections";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }

      setDraggedIndex(null);
    },
    [courseId, draggedIndex, sections, reorderSections, toast]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sections & Lessons</CardTitle>
          <CardDescription>Loading sections...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sections & Lessons</CardTitle>
          <CardDescription>Failed to load sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Unable to load sections. Please try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sections & Lessons</CardTitle>
              <CardDescription>
                Organize your course content into sections. Drag sections to
                reorder them.
              </CardDescription>
            </div>
            {formMode === "hidden" && (
              <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Section Form */}
          {formMode !== "hidden" && (
            <div className="mb-4">
              <SectionForm
                key={editingSection?.id ?? "create"}
                initialData={editingSection ?? undefined}
                mode={formMode === "create" ? "create" : "edit"}
                onSubmit={
                  formMode === "create"
                    ? handleCreateSubmit
                    : handleUpdateSubmit
                }
                onCancel={handleFormCancel}
                isLoading={createSection.isPending || updateSection.isPending}
              />
            </div>
          )}

          {/* Sections List */}
          {sections && sections.length > 0 ? (
            <div className="space-y-2">
              {sections.length > 1 && (
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <GripVertical className="h-3 w-3" />
                  Drag sections to reorder
                </p>
              )}
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={
                    dragOverIndex === index
                      ? "border-t-2 border-primary pt-2"
                      : ""
                  }
                >
                  <SectionItem
                    section={section}
                    isDragging={draggedIndex === index}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAddLesson={onAddLesson}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  No sections yet. Add a section to start organizing your course
                  content.
                </p>
                {formMode === "hidden" && (
                  <Button variant="outline" onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Section
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingSection}
        onOpenChange={(open) => !open && setDeletingSection(null)}
        title="Delete Section"
        description={
          deletingSection
            ? `Are you sure you want to delete "${deletingSection.title}"? ${
                deletingSection.lessonCount > 0
                  ? `This will also delete ${deletingSection.lessonCount} lesson(s). `
                  : ""
              }This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        isLoading={deleteSection.isPending}
      />
    </>
  );
}

export default SectionManager;
