/**
 * Listening Vocabulary Editor Component
 * Editor for adding/editing vocabulary items in listening lessons
 * Includes timestamp support for syncing vocabulary with audio
 */

import { useState } from "react";
import {
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";

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
import type { ListeningVocabularyItemFormData } from "../schemas/listeningLesson.schema";

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
] as const;

interface ListeningVocabularyEditorProps {
  /** Vocabulary item data */
  item: ListeningVocabularyItemFormData;
  /** Item index (1-based for display) */
  index: number;
  /** Audio duration for timestamp validation */
  audioDuration?: number;
  /** Callback when item is updated */
  onChange: (item: ListeningVocabularyItemFormData) => void;
  /** Callback when item is deleted */
  onDelete: () => void;
  /** Error messages for fields */
  errors?: {
    word?: string;
    definition?: string;
    example?: string;
    partOfSpeech?: string;
    timestamp?: string;
  };
}

/**
 * Format seconds to MM:SS display
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * ListeningVocabularyEditor - Edit a single vocabulary item with timestamp
 */
export function ListeningVocabularyEditor({
  item,
  index,
  audioDuration,
  onChange,
  onDelete,
  errors,
}: ListeningVocabularyEditorProps) {
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
    const typedValue = value as ListeningVocabularyItemFormData["partOfSpeech"];
    onChange({ ...item, partOfSpeech: typedValue || undefined });
  };

  // Update timestamp
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onChange({ ...item, timestamp: undefined });
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        onChange({ ...item, timestamp: numValue });
      }
    }
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
            {item.timestamp !== undefined && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimestamp(item.timestamp)}
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
          {/* Word, Part of Speech, and Timestamp - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Timestamp */}
            <div className="space-y-2">
              <Label htmlFor={`vocab-${index}-timestamp`}>
                Timestamp{" "}
                <span className="text-muted-foreground">(seconds)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id={`vocab-${index}-timestamp`}
                  type="number"
                  min={0}
                  max={audioDuration || 99999}
                  value={item.timestamp ?? ""}
                  onChange={handleTimestampChange}
                  placeholder="0"
                />
              </div>
              {audioDuration && item.timestamp !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(item.timestamp)} /{" "}
                  {formatTimestamp(audioDuration)}
                </p>
              )}
              {errors?.timestamp && (
                <p className="text-sm text-destructive">{errors.timestamp}</p>
              )}
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

export default ListeningVocabularyEditor;
