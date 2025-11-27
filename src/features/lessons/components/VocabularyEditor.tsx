/**
 * Vocabulary Editor Component
 * Editor for adding/editing vocabulary items in reading lessons
 */

import { useState } from "react";
import { Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VocabularyItemFormData } from "../schemas/readingLesson.schema";

/** Parts of speech options */
const PARTS_OF_SPEECH = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "preposition", label: "Preposition" },
  { value: "conjunction", label: "Conjunction" },
  { value: "interjection", label: "Interjection" },
  { value: "pronoun", label: "Pronoun" },
  { value: "article", label: "Article" },
  { value: "phrase", label: "Phrase" },
  { value: "idiom", label: "Idiom" },
] as const;

interface VocabularyEditorProps {
  /** Vocabulary item data */
  item: VocabularyItemFormData;
  /** Item index (1-based for display) */
  index: number;
  /** Callback when item is updated */
  onChange: (item: VocabularyItemFormData) => void;
  /** Callback when item is deleted */
  onDelete: () => void;
  /** Error messages for fields */
  errors?: {
    word?: string;
    definition?: string;
    example?: string;
    partOfSpeech?: string;
  };
}

/**
 * VocabularyEditor - Edit a single vocabulary item
 */
export function VocabularyEditor({
  item,
  index,
  onChange,
  onDelete,
  errors,
}: VocabularyEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Update word
  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, word: e.target.value });
  };

  // Update definition
  const handleDefinitionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ ...item, definition: e.target.value });
  };

  // Update example
  const handleExampleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...item, example: e.target.value || undefined });
  };

  // Update part of speech
  const handlePartOfSpeechChange = (value: string) => {
    // Cast to the correct type or undefined if empty
    const typedValue = value as VocabularyItemFormData["partOfSpeech"];
    onChange({ ...item, partOfSpeech: typedValue || undefined });
  };

  const hasErrors = errors?.word || errors?.definition;

  return (
    <Card className={cn(hasErrors && "border-destructive")}>
      <CardHeader className="p-3">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
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
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Title with word preview */}
          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium">
              {item.word ? item.word : `Word ${index}`}
            </span>
            {item.partOfSpeech && (
              <Badge variant="outline" className="text-xs">
                {item.partOfSpeech}
              </Badge>
            )}
          </div>

          {/* Delete button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            aria-label={`Delete vocabulary word ${index}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Word and Part of Speech - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Word */}
            <div className="space-y-2">
              <Label htmlFor={`vocab-${index}-word`}>
                Word <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`vocab-${index}-word`}
                value={item.word}
                onChange={handleWordChange}
                placeholder="Enter vocabulary word..."
                maxLength={100}
                aria-invalid={!!errors?.word}
              />
              {errors?.word && (
                <p className="text-sm text-destructive">{errors.word}</p>
              )}
            </div>

            {/* Part of Speech */}
            <div className="space-y-2">
              <Label htmlFor={`vocab-${index}-pos`}>
                Part of Speech{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Select
                value={item.partOfSpeech || ""}
                onValueChange={handlePartOfSpeechChange}
              >
                <SelectTrigger id={`vocab-${index}-pos`}>
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  {PARTS_OF_SPEECH.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Definition */}
          <div className="space-y-2">
            <Label htmlFor={`vocab-${index}-definition`}>
              Definition <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`vocab-${index}-definition`}
              value={item.definition}
              onChange={handleDefinitionChange}
              placeholder="Enter the definition..."
              rows={2}
              maxLength={500}
              aria-invalid={!!errors?.definition}
            />
            {errors?.definition && (
              <p className="text-sm text-destructive">{errors.definition}</p>
            )}
          </div>

          {/* Example */}
          <div className="space-y-2">
            <Label htmlFor={`vocab-${index}-example`}>
              Example Sentence{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id={`vocab-${index}-example`}
              value={item.example || ""}
              onChange={handleExampleChange}
              placeholder="Use the word in a sentence..."
              rows={2}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              An example sentence helps learners understand the word in context.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default VocabularyEditor;
