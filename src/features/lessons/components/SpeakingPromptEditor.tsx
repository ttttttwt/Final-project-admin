/**
 * Speaking Prompt Editor Component
 * Edit individual speaking prompts with sample answers, grammar, and vocabulary
 */

import { useState } from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageSquare,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { SpeakingPromptFormData } from "../schemas/speakingLesson.schema";

interface SpeakingPromptEditorProps {
  /** The prompt data */
  prompt: SpeakingPromptFormData;
  /** 1-based index for display */
  index: number;
  /** Whether this is the only prompt (prevents deletion) */
  isOnly: boolean;
  /** Callback when prompt changes */
  onChange: (prompt: SpeakingPromptFormData) => void;
  /** Callback when delete is requested */
  onDelete: () => void;
  /** Validation errors */
  errors?: {
    prompt?: string;
    context?: string;
    sampleAnswers?: string;
    targetGrammar?: string;
    targetVocabulary?: string;
  };
}

/**
 * SpeakingPromptEditor - Single prompt editor with collapsible sections
 */
export function SpeakingPromptEditor({
  prompt,
  index,
  isOnly,
  onChange,
  onDelete,
  errors,
}: SpeakingPromptEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [newSampleAnswer, setNewSampleAnswer] = useState("");
  const [newGrammar, setNewGrammar] = useState("");
  const [newVocabulary, setNewVocabulary] = useState("");

  // Update prompt text
  const handlePromptChange = (text: string) => {
    onChange({ ...prompt, prompt: text });
  };

  // Update context
  const handleContextChange = (text: string) => {
    onChange({ ...prompt, context: text });
  };

  // Sample answers management
  const handleAddSampleAnswer = () => {
    if (!newSampleAnswer.trim()) return;
    const newAnswers = [
      ...(prompt.sampleAnswers || []),
      newSampleAnswer.trim(),
    ];
    onChange({ ...prompt, sampleAnswers: newAnswers });
    setNewSampleAnswer("");
  };

  const handleRemoveSampleAnswer = (idx: number) => {
    const newAnswers = (prompt.sampleAnswers || []).filter((_, i) => i !== idx);
    onChange({ ...prompt, sampleAnswers: newAnswers });
  };

  // Grammar points management
  const handleAddGrammar = () => {
    if (!newGrammar.trim()) return;
    const newGrammarPoints = [
      ...(prompt.targetGrammar || []),
      newGrammar.trim(),
    ];
    onChange({ ...prompt, targetGrammar: newGrammarPoints });
    setNewGrammar("");
  };

  const handleRemoveGrammar = (idx: number) => {
    const newGrammarPoints = (prompt.targetGrammar || []).filter(
      (_, i) => i !== idx
    );
    onChange({ ...prompt, targetGrammar: newGrammarPoints });
  };

  // Vocabulary management
  const handleAddVocabulary = () => {
    if (!newVocabulary.trim()) return;
    const newVocabItems = [
      ...(prompt.targetVocabulary || []),
      newVocabulary.trim(),
    ];
    onChange({ ...prompt, targetVocabulary: newVocabItems });
    setNewVocabulary("");
  };

  const handleRemoveVocabulary = (idx: number) => {
    const newVocabItems = (prompt.targetVocabulary || []).filter(
      (_, i) => i !== idx
    );
    onChange({ ...prompt, targetVocabulary: newVocabItems });
  };

  // Preview text (truncated)
  const promptPreview = prompt.prompt
    ? prompt.prompt.slice(0, 60) + (prompt.prompt.length > 60 ? "..." : "")
    : "New prompt";

  // Count items for display
  const sampleCount = prompt.sampleAnswers?.length || 0;
  const grammarCount = prompt.targetGrammar?.length || 0;
  const vocabCount = prompt.targetVocabulary?.length || 0;

  return (
    <Card className={errors?.prompt ? "border-destructive" : ""}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Prompt {index}</CardTitle>
                </div>
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              {sampleCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {sampleCount} sample{sampleCount !== 1 ? "s" : ""}
                </Badge>
              )}
              {grammarCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {grammarCount} grammar
                </Badge>
              )}
              {vocabCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {vocabCount} vocab
                </Badge>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={isOnly}
                aria-label={`Delete prompt ${index}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          {!isOpen && (
            <CardDescription className="mt-1 text-sm">
              {promptPreview}
            </CardDescription>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Main Prompt Text */}
            <div className="space-y-2">
              <Label htmlFor={`prompt-${index}-text`}>
                Prompt Text <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id={`prompt-${index}-text`}
                value={prompt.prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="What should the learner say? e.g., 'Greet the waiter and ask for a menu'"
                rows={3}
                maxLength={1000}
                aria-invalid={!!errors?.prompt}
              />
              {errors?.prompt && (
                <p className="text-sm text-destructive">{errors.prompt}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {prompt.prompt.length}/1,000 characters
              </p>
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor={`prompt-${index}-context`}>
                Context{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id={`prompt-${index}-context`}
                value={prompt.context || ""}
                onChange={(e) => handleContextChange(e.target.value)}
                placeholder="Situational context, e.g., 'You just sat down at a restaurant'"
                rows={2}
                maxLength={500}
              />
              {errors?.context && (
                <p className="text-sm text-destructive">{errors.context}</p>
              )}
            </div>

            {/* Sample Answers */}
            <div className="space-y-3">
              <Label>
                Sample Answers{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Example responses learners can reference
              </p>

              {prompt.sampleAnswers && prompt.sampleAnswers.length > 0 && (
                <div className="space-y-2">
                  {prompt.sampleAnswers.map((answer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <span className="flex-1 text-sm italic">"{answer}"</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveSampleAnswer(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newSampleAnswer}
                  onChange={(e) => setNewSampleAnswer(e.target.value)}
                  placeholder="Add a sample answer..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSampleAnswer();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddSampleAnswer}
                  disabled={!newSampleAnswer.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors?.sampleAnswers && (
                <p className="text-sm text-destructive">
                  {errors.sampleAnswers}
                </p>
              )}
            </div>

            {/* Target Grammar */}
            <div className="space-y-3">
              <Label>
                Target Grammar{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Grammar points to practice, e.g., "modal verbs", "present
                perfect"
              </p>

              {prompt.targetGrammar && prompt.targetGrammar.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {prompt.targetGrammar.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveGrammar(idx)}
                        className="ml-1 hover:text-destructive"
                        aria-label={`Remove grammar point: ${item}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newGrammar}
                  onChange={(e) => setNewGrammar(e.target.value)}
                  placeholder="Add grammar point..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGrammar();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddGrammar}
                  disabled={!newGrammar.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors?.targetGrammar && (
                <p className="text-sm text-destructive">
                  {errors.targetGrammar}
                </p>
              )}
            </div>

            {/* Target Vocabulary */}
            <div className="space-y-3">
              <Label>
                Target Vocabulary{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Key words learners should try to use
              </p>

              {prompt.targetVocabulary &&
                prompt.targetVocabulary.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prompt.targetVocabulary.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveVocabulary(idx)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove vocabulary: ${item}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

              <div className="flex gap-2">
                <Input
                  value={newVocabulary}
                  onChange={(e) => setNewVocabulary(e.target.value)}
                  placeholder="Add vocabulary word..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddVocabulary();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddVocabulary}
                  disabled={!newVocabulary.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors?.targetVocabulary && (
                <p className="text-sm text-destructive">
                  {errors.targetVocabulary}
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default SpeakingPromptEditor;
