/**
 * Speaking Lesson Editor Component
 * Main editor for creating/editing SPEAKING type lessons
 * Manages scenario, prompts, and role-play settings with validation
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Mic,
  MessageSquare,
  Settings,
  Save,
  ChevronLeft,
  Users,
  Clock,
  Target,
  Bot,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SpeakingPromptEditor } from "./SpeakingPromptEditor";
import {
  speakingLessonFormSchema,
  type SpeakingLessonFormData,
  type SpeakingPromptFormData,
  type RolePlaySettingsFormData,
  defaultSpeakingPrompt,
  defaultRolePlaySettings,
  calculateSpeakingDuration,
  difficultyLabels,
  difficultyColors,
  type SpeakingDifficulty,
} from "../schemas/speakingLesson.schema";

interface SpeakingLessonEditorProps {
  /** Initial data for editing (optional) */
  initialData?: Partial<SpeakingLessonFormData>;
  /** Callback when form is submitted */
  onSubmit: (data: SpeakingLessonFormData) => void;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Submit button text */
  submitLabel?: string;
}

/**
 * SpeakingLessonEditor - Complete editor for SPEAKING lessons
 */
export function SpeakingLessonEditor({
  initialData,
  onSubmit,
  onBack,
  isSubmitting = false,
  submitLabel = "Create Lesson",
}: SpeakingLessonEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [enableRolePlay, setEnableRolePlay] = useState(
    !!initialData?.rolePlaySettings?.aiPersona
  );

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpeakingLessonFormData>({
    resolver: zodResolver(speakingLessonFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      scenario: initialData?.scenario || "",
      difficulty: initialData?.difficulty || "beginner",
      prompts: initialData?.prompts || [{ ...defaultSpeakingPrompt }],
      rolePlaySettings: initialData?.rolePlaySettings || {
        ...defaultRolePlaySettings,
      },
    },
  });

  // Watch form values for live updates
  const prompts = watch("prompts");
  const title = watch("title");
  const difficulty = watch("difficulty");
  const rolePlaySettings = watch("rolePlaySettings");

  // Calculate stats
  const promptCount = prompts.length;
  const estimatedDuration = calculateSpeakingDuration(
    prompts,
    enableRolePlay ? rolePlaySettings?.turns : undefined
  );

  // === Prompt Handlers ===
  const handlePromptChange = useCallback(
    (index: number, prompt: SpeakingPromptFormData) => {
      const newPrompts = [...prompts];
      newPrompts[index] = prompt;
      setValue("prompts", newPrompts, { shouldValidate: true });
    },
    [prompts, setValue]
  );

  const handleAddPrompt = useCallback(() => {
    setValue("prompts", [...prompts, { ...defaultSpeakingPrompt }], {
      shouldValidate: true,
    });
  }, [prompts, setValue]);

  const handleDeletePrompt = useCallback(
    (index: number) => {
      const newPrompts = prompts.filter(
        (_: SpeakingPromptFormData, i: number) => i !== index
      );
      setValue("prompts", newPrompts, { shouldValidate: true });
    },
    [prompts, setValue]
  );

  // === Role Play Settings Handlers ===
  const handleRolePlayToggle = useCallback(
    (enabled: boolean) => {
      setEnableRolePlay(enabled);
      if (enabled) {
        setValue(
          "rolePlaySettings",
          { ...defaultRolePlaySettings },
          {
            shouldValidate: true,
          }
        );
      } else {
        setValue("rolePlaySettings", undefined, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRolePlaySettingsChange = useCallback(
    (settings: Partial<RolePlaySettingsFormData>) => {
      setValue(
        "rolePlaySettings",
        { ...rolePlaySettings, ...settings },
        { shouldValidate: true }
      );
    },
    [rolePlaySettings, setValue]
  );

  // Get error counts for tab badges
  const promptErrors = errors.prompts?.length || 0;
  const basicErrors =
    (errors.title ? 1 : 0) +
    (errors.description ? 1 : 0) +
    (errors.scenario ? 1 : 0) +
    (errors.difficulty ? 1 : 0);
  const settingsErrors = errors.rolePlaySettings ? 1 : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {title || "New Speaking Lesson"}
            </h1>
            <p className="text-muted-foreground">
              Configure speaking prompts and role-play settings
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>

      <Separator />

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Prompts</span>
            </div>
            <p className="text-2xl font-bold mt-1">{promptCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Difficulty</span>
            </div>
            <Badge variant={difficultyColors[difficulty]} className="mt-2">
              {difficultyLabels[difficulty]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Role-Play</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {enableRolePlay ? "On" : "Off"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Est. Time</span>
            </div>
            <p className="text-2xl font-bold mt-1">{estimatedDuration} min</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="relative">
            Basic Info
            {basicErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {basicErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="prompts" className="relative">
            <Mic className="h-4 w-4 mr-2" />
            Prompts ({prompts.length})
            {promptErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {promptErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="relative">
            <Settings className="h-4 w-4 mr-2" />
            Role-Play
            {settingsErrors > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 p-0 text-xs flex items-center justify-center">
                {settingsErrors}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>
                Basic information about this speaking lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lesson Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Lesson Title <span className="text-destructive">*</span>
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
                <p className="text-xs text-muted-foreground">
                  This title will be displayed in the course outline.
                </p>
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
                  placeholder="Brief description of the speaking activity..."
                  rows={3}
                  maxLength={1000}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">
                  Difficulty Level <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={difficulty}
                  onValueChange={(value: SpeakingDifficulty) =>
                    setValue("difficulty", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Beginner</Badge>
                        <span className="text-muted-foreground">
                          - Simple vocabulary, basic phrases
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Intermediate</Badge>
                        <span className="text-muted-foreground">
                          - Complex sentences, varied vocabulary
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Advanced</Badge>
                        <span className="text-muted-foreground">
                          - Nuanced language, idiomatic expressions
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.difficulty && (
                  <p className="text-sm text-destructive">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>

              {/* Scenario */}
              <div className="space-y-2">
                <Label htmlFor="scenario">
                  Scenario Description{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="scenario"
                  {...register("scenario")}
                  placeholder="Describe the speaking scenario, e.g., 'Ordering food at a restaurant - practice conversation with a waiter'"
                  rows={4}
                  maxLength={2000}
                  aria-invalid={!!errors.scenario}
                />
                {errors.scenario && (
                  <p className="text-sm text-destructive">
                    {errors.scenario.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This sets the context for all prompts in this lesson.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Speaking Prompts</h3>
              <p className="text-sm text-muted-foreground">
                Add prompts with sample answers and learning targets
              </p>
            </div>
            <Button type="button" onClick={handleAddPrompt}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </div>

          {errors.prompts && !Array.isArray(errors.prompts) && (
            <p className="text-sm text-destructive">{errors.prompts.message}</p>
          )}

          <div className="space-y-4">
            {prompts.map((prompt: SpeakingPromptFormData, index: number) => (
              <SpeakingPromptEditor
                key={index}
                prompt={prompt}
                index={index + 1}
                isOnly={prompts.length === 1}
                onChange={(p) => handlePromptChange(index, p)}
                onDelete={() => handleDeletePrompt(index)}
                errors={{
                  prompt: errors.prompts?.[index]?.prompt?.message,
                  context: errors.prompts?.[index]?.context?.message,
                  sampleAnswers:
                    errors.prompts?.[index]?.sampleAnswers?.message,
                  targetGrammar:
                    errors.prompts?.[index]?.targetGrammar?.message,
                  targetVocabulary:
                    errors.prompts?.[index]?.targetVocabulary?.message,
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* Role-Play Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Role-Play Settings
              </CardTitle>
              <CardDescription>
                Configure AI-powered conversation practice (available in future
                update)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Role-Play Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-roleplay">Enable Role-Play</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow learners to practice with an AI conversation partner
                  </p>
                </div>
                <Switch
                  id="enable-roleplay"
                  checked={enableRolePlay}
                  onCheckedChange={handleRolePlayToggle}
                />
              </div>

              {enableRolePlay && (
                <>
                  <Separator />

                  {/* AI Persona */}
                  <div className="space-y-2">
                    <Label htmlFor="aiPersona">
                      AI Persona{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="aiPersona"
                      value={rolePlaySettings?.aiPersona || ""}
                      onChange={(e) =>
                        handleRolePlaySettingsChange({
                          aiPersona: e.target.value,
                        })
                      }
                      placeholder="e.g., friendly hotel receptionist, strict job interviewer"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      Define the character role the AI will play in the
                      conversation.
                    </p>
                  </div>

                  {/* Conversation Turns */}
                  <div className="space-y-2">
                    <Label htmlFor="turns">
                      Conversation Turns{" "}
                      <span className="text-muted-foreground">(1-20)</span>
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="turns"
                        type="number"
                        min={1}
                        max={20}
                        value={rolePlaySettings?.turns || 5}
                        onChange={(e) =>
                          handleRolePlaySettingsChange({
                            turns: parseInt(e.target.value, 10) || 5,
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        turn{(rolePlaySettings?.turns || 5) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Number of back-and-forth exchanges in the conversation.
                    </p>
                  </div>

                  {/* Enable Feedback */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableFeedback">AI Feedback</Label>
                      <p className="text-sm text-muted-foreground">
                        Provide feedback on grammar, vocabulary, and fluency
                      </p>
                    </div>
                    <Switch
                      id="enableFeedback"
                      checked={rolePlaySettings?.enableFeedback ?? true}
                      onCheckedChange={(checked) =>
                        handleRolePlaySettingsChange({
                          enableFeedback: checked,
                        })
                      }
                    />
                  </div>

                  {/* Preview Card */}
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Role-Play Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        <strong>AI Role:</strong>{" "}
                        {rolePlaySettings?.aiPersona || "General assistant"}
                      </p>
                      <p>
                        <strong>Conversation:</strong>{" "}
                        {rolePlaySettings?.turns || 5} turns
                      </p>
                      <p>
                        <strong>Feedback:</strong>{" "}
                        {rolePlaySettings?.enableFeedback !== false
                          ? "Enabled"
                          : "Disabled"}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              {!enableRolePlay && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Role-play is disabled for this lesson.</p>
                  <p className="text-sm">
                    Enable it to allow AI-powered conversation practice.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
            {promptCount} prompt{promptCount !== 1 && "s"},{" "}
            {difficultyLabels[difficulty].toLowerCase()} level, ~
            {estimatedDuration} min
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

export default SpeakingLessonEditor;
