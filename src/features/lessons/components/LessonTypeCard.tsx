/**
 * Lesson Type Card Component
 * Card for displaying and selecting a lesson type
 */

import { BookOpen, Headphones, ClipboardCheck, Mic } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LessonType, LessonTypeInfo } from "../types/lesson.types";

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Headphones,
  ClipboardCheck,
  Mic,
};

interface LessonTypeCardProps {
  /** Lesson type info */
  lessonType: LessonTypeInfo;
  /** Whether this type is currently selected */
  isSelected?: boolean;
  /** Callback when card is clicked */
  onSelect?: (type: LessonType) => void;
  /** Whether the card is disabled */
  disabled?: boolean;
}

/**
 * LessonTypeCard - Displays a lesson type option with icon and description
 */
export function LessonTypeCard({
  lessonType,
  isSelected = false,
  onSelect,
  disabled = false,
}: LessonTypeCardProps) {
  const Icon = iconMap[lessonType.icon] || BookOpen;

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(lessonType.type);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled && onSelect) {
      e.preventDefault();
      onSelect(lessonType.type);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected && "border-primary border-2 shadow-md bg-primary/5",
        disabled &&
          "opacity-50 cursor-not-allowed hover:shadow-none hover:border-border"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              lessonType.color,
              "bg-opacity-10",
              isSelected && "bg-opacity-20"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                lessonType.color.replace("bg-", "text-")
              )}
            />
          </div>
          <CardTitle className="text-lg">{lessonType.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {lessonType.description}
        </p>
      </CardContent>
    </Card>
  );
}

export default LessonTypeCard;
