/**
 * ThumbnailUpload Component
 * Reusable component for uploading and managing course thumbnails
 * Supports both file upload and URL input
 */

import { useState, useRef } from "react";
import { Upload, Trash2, Image as ImageIcon, Loader2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getAbsoluteUrl } from "@/lib/utils";

interface ThumbnailUploadProps {
  courseId: number;
  currentThumbnailUrl?: string | null;
  onUploadSuccess?: (thumbnailUrl: string) => void;
  onDeleteSuccess?: () => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * ThumbnailUpload - Component for uploading course thumbnails
 */
export function ThumbnailUpload({
  courseId,
  currentThumbnailUrl,
  onUploadSuccess,
  onDeleteSuccess,
  disabled = false,
}: ThumbnailUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get absolute URL for display
  const absoluteThumbnailUrl = getAbsoluteUrl(currentThumbnailUrl);

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload a JPG, PNG, or WebP image.";
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return "File size exceeds 5MB. Please upload a smaller image.";
    }

    return null;
  };

  /**
   * Handle file selection
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast({
        variant: "destructive",
        title: "Validation error",
        description: validationError,
      });
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Import API dynamically to avoid circular dependencies
      const { coursesApi } = await import("../api/coursesApi");
      const updatedCourse = await coursesApi.uploadThumbnail(courseId, file);

      toast({
        title: "Thumbnail uploaded",
        description: "Course thumbnail has been updated successfully.",
      });

      onUploadSuccess?.(updatedCourse.thumbnailUrl || "");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload thumbnail. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Handle thumbnail deletion
   */
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { coursesApi } = await import("../api/coursesApi");
      await coursesApi.deleteThumbnail(courseId);

      toast({
        title: "Thumbnail deleted",
        description: "Course thumbnail has been removed successfully.",
      });

      onDeleteSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete thumbnail. Please try again.";
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  /**
   * Handle URL submission
   */
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const { coursesApi } = await import("../api/coursesApi");
      // Update course with new thumbnail URL
      const updatedCourse = await coursesApi.updateCourse(courseId, {
        thumbnailUrl: urlInput,
      });

      toast({
        title: "Thumbnail updated",
        description: "Course thumbnail URL has been updated successfully.",
      });

      setUrlInput("");
      onUploadSuccess?.(updatedCourse.thumbnailUrl || "");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update thumbnail URL. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Unified Thumbnail Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Thumbnail Preview (if exists) */}
          {absoluteThumbnailUrl && (
            <div className="space-y-4">
              <img
                src={absoluteThumbnailUrl}
                alt="Course thumbnail"
                className="h-32 w-48 object-cover rounded-lg border cursor-pointer"
                onClick={() => setIsPreviewDialogOpen(true)}
                onError={(e) => {
                  console.error("Failed to load image:", absoluteThumbnailUrl);
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-4">
            {!absoluteThumbnailUrl && (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Thumbnail</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Choose a file or enter URL (JPG, PNG, WebP, max 5MB)
                </p>
              </div>
            )}

            {/* File Upload Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={absoluteThumbnailUrl ? "outline" : "default"}
                onClick={handleUploadClick}
                disabled={disabled || isUploading || isDeleting}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {absoluteThumbnailUrl ? "Change File" : "Upload File"}
                  </>
                )}
              </Button>

              {/* Delete Button (only when thumbnail exists) */}
              {absoluteThumbnailUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={disabled || isUploading || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* URL Input */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or use URL
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={disabled || isUploading || isDeleting}
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleUrlSubmit}
                disabled={disabled || isUploading || isDeleting || !urlInput.trim()}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Set"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Supported: JPG, PNG, WebP • Max: 5MB • Recommended: 1200x630px
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading || isDeleting}
        aria-label="Upload thumbnail file"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete thumbnail"
        description="Are you sure you want to remove this thumbnail? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center">
            <img
              src={absoluteThumbnailUrl ?? undefined}
              alt="Course thumbnail preview"
              className="max-w-full max-h-[80vh] object-contain"
              onError={(e) => {
                console.error("Failed to load image:", absoluteThumbnailUrl);
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
