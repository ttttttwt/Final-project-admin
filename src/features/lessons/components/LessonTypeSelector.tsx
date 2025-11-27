/**
 * Lesson Type Selector Component
 * Displays all lesson types for selection
 */

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonTypeCard } from "./LessonTypeCard";
import { LESSON_TYPES } from "../types/lesson.types";
import type { LessonType } from "../types/lesson.types";

interface LessonTypeSelectorProps {
  /** Currently selected lesson type */
  selectedType: LessonType | null;
  /** Callback when a type is selected */
  onSelect: (type: LessonType) => void;
  /** Callback when user wants to proceed to next step */
  onContinue: () => void;
  /** Whether the continue button should be disabled */
  disabled?: boolean;
}

/**
 * LessonTypeSelector - Grid of lesson type cards with continue button
 */
export function LessonTypeSelector({
  selectedType,
  onSelect,
  onContinue,
  disabled = false,
}: LessonTypeSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Select Lesson Type
        </h2>
        <p className="text-muted-foreground mt-1">
          Choose the type of lesson you want to create. Each type has specific
          content requirements and features.
        </p>
      </div>

      {/* Lesson Type Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {LESSON_TYPES.map((lessonType) => (
          <LessonTypeCard
            key={lessonType.type}
            lessonType={lessonType}
            isSelected={selectedType === lessonType.type}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Selected Type Info & Continue */}
      {selectedType && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div>
            <p className="font-medium">
              Selected:{" "}
              <span className="text-primary">
                {LESSON_TYPES.find((t) => t.type === selectedType)?.title}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Click Continue to proceed to the lesson editor
            </p>
          </div>
          <Button onClick={onContinue} disabled={disabled}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default LessonTypeSelector;
