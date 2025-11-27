/**
 * Section Form Component
 * Form for creating and editing sections
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Section, CreateSectionInput } from "../types/course.types";

interface SectionFormProps {
  /** Initial data for editing an existing section */
  initialData?: Section;
  /** Callback when form is submitted */
  onSubmit: (data: CreateSectionInput) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Whether the form is in a loading state */
  isLoading?: boolean;
  /** Form mode - create or edit */
  mode?: "create" | "edit";
}

/**
 * SectionForm - Form component for creating and editing sections
 */
export function SectionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create",
}: SectionFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);

  const validateTitle = (value: string): boolean => {
    if (!value.trim()) {
      setTitleError("Section title is required");
      return false;
    }
    if (value.length > 255) {
      setTitleError("Section title must not exceed 255 characters");
      return false;
    }
    setTitleError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTitle(title)) {
      return;
    }

    onSubmit({ title: title.trim() });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (titleError) {
      validateTitle(value);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {mode === "create" ? "Add New Section" : "Edit Section"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">
                Section Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="section-title"
                placeholder="e.g., Getting Started with Grammar"
                value={title}
                onChange={handleTitleChange}
                onBlur={() => validateTitle(title)}
                disabled={isLoading}
                aria-invalid={!!titleError}
                aria-describedby={titleError ? "title-error" : undefined}
              />
              {titleError && (
                <p
                  id="title-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {titleError}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !title.trim()}>
            {isLoading
              ? "Saving..."
              : mode === "create"
              ? "Add Section"
              : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default SectionForm;
