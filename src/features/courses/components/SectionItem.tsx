/**
 * Section Item Component
 * Displays a single section with actions
 */

import { useState } from "react";
import {
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Section } from "../types/course.types";

interface SectionItemProps {
  /** Section data */
  section: Section;
  /** Whether the section is being dragged */
  isDragging?: boolean;
  /** Callback when edit button is clicked */
  onEdit: (section: Section) => void;
  /** Callback when delete button is clicked */
  onDelete: (section: Section) => void;
  /** Callback when add lesson button is clicked */
  onAddLesson?: (sectionId: number) => void;
  /** Props for drag handle */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

/**
 * SectionItem - A component for displaying a single section
 */
export function SectionItem({
  section,
  isDragging = false,
  onEdit,
  onDelete,
  onAddLesson,
  dragHandleProps,
}: SectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-all",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 p-3">
        {/* Drag Handle */}
        <button
          type="button"
          className="cursor-grab p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label="Drag to reorder section"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse section" : "Expand section"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Section Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{section.title}</span>
            <Badge variant="secondary" className="text-xs">
              {section.lessonCount}{" "}
              {section.lessonCount === 1 ? "lesson" : "lessons"}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(section)}
            aria-label={`Edit section: ${section.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(section)}
            aria-label={`Delete section: ${section.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Content - Lessons Placeholder */}
      {isExpanded && (
        <div className="border-t px-4 py-3">
          {section.lessonCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No lessons in this section yet.
              </p>
              {onAddLesson && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddLesson(section.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Lesson
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This section contains {section.lessonCount}{" "}
                {section.lessonCount === 1 ? "lesson" : "lessons"}.
              </p>
              {onAddLesson && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddLesson(section.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lesson
                </Button>
              )}
              <p className="text-xs text-muted-foreground italic">
                Lesson management will be available in the next update.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SectionItem;
