/**
 * Listening Lesson Editor Component
 * Main editor for creating/editing LISTENING type lessons
 * Manages audio settings, transcript, questions, and vocabulary with validation
 */

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Headphones,
  HelpCircle,
  BookText,
  Save,
  ChevronLeft,
  Upload,
  Play,
  Pause,
  Volume2,
  FileAudio,
  AlertCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ListeningQuestionEditor } from "./ListeningQuestionEditor";
import { ListeningVocabularyEditor } from "./ListeningVocabularyEditor";
import {
  listeningLessonFormSchema,
  type ListeningLessonFormData,
  type ListeningQuestionFormData,
  type ListeningVocabularyItemFormData,
  defaultListeningQuestion,
  defaultListeningVocabularyItem,
} from "../schemas/listeningLesson.schema";

/** Convert relative URL to full URL for audio playback */
const getFullAudioUrl = (url: string | undefined): string => {
  if (!url) return "";
  // If already a full URL or blob URL, return as-is
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  // Convert relative URL to full URL using API base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088/api/v1";
  // Remove /api/v1 suffix from base URL if the relative URL already has it
  const serverBaseUrl = baseUrl.replace(/\/api\/v1\/?$/, "");
  return `${serverBaseUrl}${url}`;
};

interface ListeningLessonEditorProps {
  /** Initial data for editing (optional) */
  initialData?: Partial<ListeningLessonFormData>;
  /** Callback when form is submitted, with optional pending audio file */
  onSubmit: (data: ListeningLessonFormData, pendingAudioFile?: File) => void;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Submit button text */
  submitLabel?: string;
}

/**
 * Format seconds to MM:SS display
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * ListeningLessonEditor - Complete editor for LISTENING lessons
 */
export function ListeningLessonEditor({
  initialData,
  onSubmit,
  onBack,
  isSubmitting = false,
  submitLabel = "Create Lesson",
}: ListeningLessonEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListeningLessonFormData>({
    resolver: zodResolver(listeningLessonFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      audioUrl: initialData?.audioUrl || "",
      duration: initialData?.duration || 0,
      transcript: initialData?.transcript || "",
      showTranscript: initialData?.showTranscript ?? false,
      questions: initialData?.questions || [{ ...defaultListeningQuestion }],
      vocabulary: initialData?.vocabulary || [],
    },
  });

  // Watch form values for live updates
  const questions = watch("questions");
  const vocabulary = watch("vocabulary");
  const title = watch("title");
  const audioUrl = watch("audioUrl");
  const duration = watch("duration");
  const showTranscript = watch("showTranscript");

  // === Audio Handlers ===
  const handleAudioUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setValue("audioUrl", url, { shouldValidate: true });
      setAudioError(null);

      // Try to load audio to get duration
      if (url) {
        const audio = new Audio(url);
        audio.addEventListener("loadedmetadata", () => {
          setValue("duration", Math.round(audio.duration), {
            shouldValidate: true,
          });
        });
        audio.addEventListener("error", () => {
          setAudioError(
            "Failed to load audio. Please check the URL is valid and accessible."
          );
        });
      }
    },
    [setValue]
  );

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) {
      if (audioUrl) {
        // Use full URL for playback (handle relative URLs from server)
        audioRef.current = new Audio(getFullAudioUrl(audioUrl));
        audioRef.current.addEventListener("ended", () => setIsPlaying(false));
        audioRef.current.addEventListener("error", () => {
          setAudioError("Failed to play audio");
          setIsPlaying(false);
        });
      } else {
        return;
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setAudioError("Failed to play audio");
          setIsPlaying(false);
        });
    }
  }, [audioUrl, isPlaying]);

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0) {
        setValue("duration", value, { shouldValidate: true });
      }
    },
    [setValue]
  );

  // Handle file selection for audio upload
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];
      if (!allowedTypes.includes(file.type)) {
        setAudioError("Invalid file type. Please select MP3, WAV, OGG, or M4A file.");
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setAudioError("File too large. Maximum size is 50MB.");
        return;
      }

      setPendingAudioFile(file);
      setAudioError(null);

      // Create local URL for preview and auto-detect duration
      const localUrl = URL.createObjectURL(file);
      setValue("audioUrl", localUrl, { shouldValidate: true });

      const audio = new Audio(localUrl);
      audio.addEventListener("loadedmetadata", () => {
        setValue("duration", Math.round(audio.duration), { shouldValidate: true });
      });
    },
    [setValue]
  );

  const handleRemovePendingFile = useCallback(() => {
    setPendingAudioFile(null);
    setValue("audioUrl", "", { shouldValidate: true });
    setValue("duration", 0, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setValue]);

  // Handle seek in audio timeline
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // === Question Handlers ===
  const handleQuestionChange = useCallback(
    (index: number, question: ListeningQuestionFormData) => {
      const newQuestions = [...questions];
      newQuestions[index] = question;
      setValue("questions", newQuestions, { shouldValidate: true });
    },
    [questions, setValue]
  );

  const handleAddQuestion = useCallback(() => {
    setValue("questions", [...questions, { ...defaultListeningQuestion }], {
      shouldValidate: true,
    });
  }, [questions, setValue]);

  const handleDeleteQuestion = useCallback(
    (index: number) => {
      const newQuestions = questions.filter(
        (_: ListeningQuestionFormData, i: number) => i !== index
      );
      setValue("questions", newQuestions, { shouldValidate: true });
    },
    [questions, setValue]
  );

  // === Vocabulary Handlers ===
  const handleVocabularyChange = useCallback(
    (index: number, item: ListeningVocabularyItemFormData) => {
      const newVocabulary = [...(vocabulary || [])];
      newVocabulary[index] = item;
      setValue("vocabulary", newVocabulary, { shouldValidate: true });
    },
    [vocabulary, setValue]
  );

  const handleAddVocabulary = useCallback(() => {
    setValue(
      "vocabulary",
      [...(vocabulary || []), { ...defaultListeningVocabularyItem }],
      {
        shouldValidate: true,
      }
    );
  }, [vocabulary, setValue]);

  const handleDeleteVocabulary = useCallback(
    (index: number) => {
      const newVocabulary = (vocabulary || []).filter(
        (_: ListeningVocabularyItemFormData, i: number) => i !== index
      );
      setValue("vocabulary", newVocabulary, { shouldValidate: true });
    },
    [vocabulary, setValue]
  );

  // Get error counts for tab badges
  const audioErrors =
    (errors.audioUrl ? 1 : 0) +
    (errors.duration ? 1 : 0) +
    (errors.transcript ? 1 : 0);
  const questionErrors = errors.questions?.length || 0;
  const basicErrors = (errors.title ? 1 : 0) + (errors.description ? 1 : 0);

  // Wrapper to pass pending file with form data
  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data, pendingAudioFile || undefined);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {title || "New Listening Lesson"}
            </h1>
            <p className="text-muted-foreground">
              Configure your listening lesson content
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="relative">
            Basic Info
            {basicErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {basicErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audio" className="relative">
            <Headphones className="h-4 w-4 mr-2" />
            Audio
            {audioErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {audioErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="questions" className="relative">
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions ({questions.length})
            {questionErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {questionErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vocabulary">
            <BookText className="h-4 w-4 mr-2" />
            Vocabulary ({vocabulary?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>
                Basic information about this listening lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter lesson title..."
                  maxLength={200}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of what learners will listen to and learn..."
                  rows={3}
                  maxLength={1000}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Audio Configuration
              </CardTitle>
              <CardDescription>
                Configure the audio file and transcript for this lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio URL */}
              <div className="space-y-2">
                <Label htmlFor="audioUrl">
                  Audio URL <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="audioUrl"
                    value={audioUrl}
                    onChange={handleAudioUrlChange}
                    placeholder="https://example.com/audio.mp3 or /uploads/audio.mp3"
                    className="flex-1"
                    aria-invalid={!!errors.audioUrl}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePlayPause}
                    disabled={!audioUrl}
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.audioUrl && (
                  <p className="text-sm text-destructive">
                    {errors.audioUrl.message}
                  </p>
                )}
                {audioError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{audioError}</AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter a URL to an audio file (MP3, WAV, etc.) or upload a file
                  to get a URL.
                </p>
              </div>

              {/* File Upload Section */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a"
                onChange={handleFileSelect}
                className="hidden"
                id="audio-file-input"
              />
              {pendingAudioFile ? (
                <div className="border-2 border-dashed border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileAudio className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{pendingAudioFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(pendingAudioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePendingFile}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Audio Player with Timeline */}
                  {audioUrl && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onEnded={() => setIsPlaying(false)}
                        onLoadedMetadata={(e) => {
                          setValue("duration", Math.round(e.currentTarget.duration), { shouldValidate: true });
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1">
                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[70px] text-right">
                          {formatDuration(Math.floor(currentTime))} / {formatDuration(duration || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ File selected. Duration auto-detected. Ready to save.
                  </p>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to browse or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP3, WAV, OGG, M4A • Max 50MB
                  </p>
                </div>
              )}

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (seconds) <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={3600}
                    value={duration}
                    onChange={handleDurationChange}
                    className="w-32"
                    aria-invalid={!!errors.duration}
                  />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Volume2 className="h-4 w-4" />
                    <span>{formatDuration(duration || 0)}</span>
                  </div>
                </div>
                {errors.duration && (
                  <p className="text-sm text-destructive">
                    {errors.duration.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This is auto-detected when you enter a valid audio URL, or you
                  can set it manually.
                </p>
              </div>

              {/* Transcript */}
              <div className="space-y-2">
                <Label htmlFor="transcript">
                  Transcript <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="transcript"
                  {...register("transcript")}
                  placeholder="Enter the full transcript of the audio..."
                  rows={8}
                  maxLength={50000}
                  aria-invalid={!!errors.transcript}
                />
                {errors.transcript && (
                  <p className="text-sm text-destructive">
                    {errors.transcript.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Required for accessibility. Learners can optionally view the
                  transcript while listening.
                </p>
              </div>

              {/* Show Transcript Initially */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="showTranscript">
                    Show Transcript Initially
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    If enabled, learners will see the transcript by default when
                    starting the lesson.
                  </p>
                </div>
                <Switch
                  id="showTranscript"
                  checked={showTranscript}
                  onCheckedChange={(checked) =>
                    setValue("showTranscript", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Comprehension Questions</h3>
              <p className="text-sm text-muted-foreground">
                Add questions to test listening comprehension. Optionally add
                timestamps to sync questions with audio.
              </p>
            </div>
            <Button type="button" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {errors.questions && !Array.isArray(errors.questions) && (
            <p className="text-sm text-destructive">
              {errors.questions.message}
            </p>
          )}

          <div className="space-y-4">
            {questions.map(
              (question: ListeningQuestionFormData, index: number) => (
                <ListeningQuestionEditor
                  key={index}
                  question={question}
                  index={index + 1}
                  isOnly={false}
                  audioDuration={duration}
                  onChange={(q) => handleQuestionChange(index, q)}
                  onDelete={() => handleDeleteQuestion(index)}
                  errors={{
                    question: errors.questions?.[index]?.question?.message,
                    type: errors.questions?.[index]?.type?.message,
                    options: errors.questions?.[index]?.options?.message,
                    correctAnswer:
                      errors.questions?.[index]?.correctAnswer?.message,
                    timestamp: errors.questions?.[index]?.timestamp?.message,
                  }}
                />
              )
            )}
          </div>
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Vocabulary List</h3>
              <p className="text-sm text-muted-foreground">
                Define key vocabulary words from the audio. Optionally add
                timestamps to highlight when words appear.
              </p>
            </div>
            <Button type="button" onClick={handleAddVocabulary}>
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
          </div>

          {!vocabulary || vocabulary.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <BookText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No vocabulary words yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add vocabulary words to help learners understand key terms
                  from the audio
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVocabulary}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Word
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vocabulary.map(
                (item: ListeningVocabularyItemFormData, index: number) => (
                  <ListeningVocabularyEditor
                    key={index}
                    item={item}
                    index={index + 1}
                    audioDuration={duration}
                    onChange={(v) => handleVocabularyChange(index, v)}
                    onDelete={() => handleDeleteVocabulary(index)}
                    errors={{
                      word: errors.vocabulary?.[index]?.word?.message,
                      definition:
                        errors.vocabulary?.[index]?.definition?.message,
                      timestamp: errors.vocabulary?.[index]?.timestamp?.message,
                    }}
                  />
                )
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {duration > 0 && `${formatDuration(duration)} audio, `}
            {questions.length} question{questions.length !== 1 && "s"},{" "}
            {vocabulary?.length || 0} vocabulary word
            {(vocabulary?.length || 0) !== 1 && "s"}
          </span>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ListeningLessonEditor;
