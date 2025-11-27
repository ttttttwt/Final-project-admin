/**
 * Passage Editor Component
 * Editor for adding/editing reading passages
 */

import { Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PassageFormData } from "../schemas/readingLesson.schema";

interface PassageEditorProps {
  /** Passage data */
  passage: PassageFormData;
  /** Passage index (1-based for display) */
  index: number;
  /** Whether this is the only passage (can't delete) */
  isOnly: boolean;
  /** Callback when passage is updated */
  onChange: (passage: PassageFormData) => void;
  /** Callback when passage is deleted */
  onDelete: () => void;
  /** Error messages for fields */
  errors?: {
    title?: string;
    text?: string;
  };
}

/**
 * PassageEditor - Edit a single passage with title and text
 */
export function PassageEditor({
  passage,
  index,
  isOnly,
  onChange,
  onDelete,
  errors,
}: PassageEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...passage, title: e.target.value });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...passage, text: e.target.value });
  };

  // Word count for the passage
  const wordCount = passage.text.trim()
    ? passage.text.trim().split(/\s+/).length
    : 0;

  return (
    <Card className={cn(errors?.text && "border-destructive")}>
      <CardHeader className="p-3">
        <div className="flex items-center gap-2">
          {/* Drag handle (placeholder for future drag-and-drop) */}
          <div className="cursor-grab text-muted-foreground hover:text-foreground p-1">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Expand/Collapse */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse passage" : "Expand passage"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Title */}
          <div className="flex-1">
            <span className="font-medium">
              Passage {index}
              {passage.title && `: ${passage.title}`}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              ({wordCount} words)
            </span>
          </div>

          {/* Delete button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            disabled={isOnly}
            aria-label={`Delete passage ${index}`}
            title={
              isOnly ? "At least one passage is required" : "Delete passage"
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor={`passage-${index}-title`}>
              Title <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id={`passage-${index}-title`}
              value={passage.title || ""}
              onChange={handleTitleChange}
              placeholder="Enter passage title..."
              maxLength={255}
              aria-invalid={!!errors?.title}
              aria-describedby={
                errors?.title ? `passage-${index}-title-error` : undefined
              }
            />
            {errors?.title && (
              <p
                id={`passage-${index}-title-error`}
                className="text-sm text-destructive"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Text Field */}
          <div className="space-y-2">
            <Label htmlFor={`passage-${index}-text`}>
              Passage Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`passage-${index}-text`}
              value={passage.text}
              onChange={handleTextChange}
              placeholder="Enter the reading passage text..."
              rows={8}
              className="resize-y min-h-[150px]"
              maxLength={10000}
              aria-invalid={!!errors?.text}
              aria-describedby={
                errors?.text ? `passage-${index}-text-error` : undefined
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {errors?.text && (
                  <span
                    id={`passage-${index}-text-error`}
                    className="text-destructive"
                  >
                    {errors.text}
                  </span>
                )}
              </span>
              <span>{passage.text.length} / 10,000 characters</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default PassageEditor;
