/**
 * AudioUpload Component
 * Reusable component for uploading and managing lesson audio files
 */

import { useState, useRef } from "react";
import { Upload, Trash2, Music, Loader2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface AudioUploadProps {
  lessonId: number;
  currentAudioUrl?: string | null;
  onUploadSuccess?: (audioUrl: string) => void;
  onDeleteSuccess?: () => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * AudioUpload - Component for uploading lesson audio files
 */
export function AudioUpload({
  lessonId,
  currentAudioUrl,
  onUploadSuccess,
  onDeleteSuccess,
  disabled = false,
}: AudioUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload an MP3, WAV, OGG, or M4A audio file.";
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return "File size exceeds 50MB. Please upload a smaller audio file.";
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
      const { lessonsApi } = await import("../api/lessonsApi");
      const updatedLesson = await lessonsApi.uploadAudio(lessonId, file);

      toast({
        title: "Audio uploaded",
        description: "Lesson audio has been updated successfully.",
      });

      onUploadSuccess?.(updatedLesson.audioUrl || "");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload audio. Please try again.";
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
   * Handle audio deletion
   */
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { lessonsApi } = await import("../api/lessonsApi");
      await lessonsApi.deleteAudio(lessonId);

      toast({
        title: "Audio deleted",
        description: "Lesson audio has been removed successfully.",
      });

      // Stop playing if currently playing
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      onDeleteSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete audio. Please try again.";
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
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Toggle audio playback
   */
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * Handle audio ended
   */
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Unified Audio Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Audio Preview (if exists) */}
          {currentAudioUrl ? (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={togglePlayback}
                disabled={disabled}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Audio File</span>
                </div>
                <audio
                  ref={audioRef}
                  src={currentAudioUrl}
                  onEnded={handleAudioEnded}
                  className="w-full"
                  controls
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No audio file</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Upload an audio file for this listening lesson (MP3, WAV, OGG, M4A, max 50MB)
              </p>
            </div>
          )}

          {/* Upload/Change/Delete Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={currentAudioUrl ? "outline" : "default"}
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
                  {currentAudioUrl ? "Change Audio" : "Upload Audio"}
                </>
              )}
            </Button>

            {/* Delete Button (only when audio exists) */}
            {currentAudioUrl && (
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

          <p className="text-xs text-muted-foreground text-center">
            Supported: MP3, WAV, OGG, M4A • Max: 50MB • Recommended: 128kbps+
          </p>
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
        aria-label="Upload audio file"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete audio file"
        description="Are you sure you want to remove this audio file? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
