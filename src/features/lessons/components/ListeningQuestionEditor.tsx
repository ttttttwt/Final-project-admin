/**
 * Listening Question Editor Component
 * Editor for adding/editing listening comprehension questions
 * Includes timestamp support for syncing questions with audio
 */

import { useState } from "react";
import {
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
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
import type { ListeningQuestionFormData } from "../schemas/listeningLesson.schema";

/** Question type labels */
const QUESTION_TYPE_LABELS = {
  multiple_choice: "Multiple Choice",
  true_false: "True/False",
  fill_blank: "Fill in the Blank",
} as const;

interface ListeningQuestionEditorProps {
  /** Question data */
  question: ListeningQuestionFormData;
  /** Question index (1-based for display) */
  index: number;
  /** Whether this is the only question (can't delete) */
  isOnly: boolean;
  /** Audio duration for timestamp validation */
  audioDuration?: number;
  /** Callback when question is updated */
  onChange: (question: ListeningQuestionFormData) => void;
  /** Callback when question is deleted */
  onDelete: () => void;
  /** Error messages for fields */
  errors?: {
    question?: string;
    type?: string;
    options?: string;
    correctAnswer?: string;
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
 * ListeningQuestionEditor - Edit a single listening question with timestamp
 */
export function ListeningQuestionEditor({
  question,
  index,
  isOnly,
  audioDuration,
  onChange,
  onDelete,
  errors,
}: ListeningQuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Update question text
  const handleQuestionTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ ...question, question: e.target.value });
  };

  // Update question type
  const handleTypeChange = (
    type: "multiple_choice" | "true_false" | "fill_blank"
  ) => {
    const newQuestion = { ...question, type };

    // Reset options and correct answer based on type
    if (type === "multiple_choice") {
      newQuestion.options = question.options?.length
        ? question.options
        : ["", ""];
      newQuestion.correctAnswer = 0;
    } else if (type === "true_false") {
      newQuestion.options = undefined;
      newQuestion.correctAnswer = "true";
    } else {
      // fill_blank - correct answer is the text to fill in
      newQuestion.options = undefined;
      newQuestion.correctAnswer = "";
    }

    onChange(newQuestion);
  };

  // Update option at index
  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onChange({ ...question, options: newOptions });
  };

  // Add new option
  const handleAddOption = () => {
    const newOptions = [...(question.options || []), ""];
    onChange({ ...question, options: newOptions });
  };

  // Remove option at index
  const handleRemoveOption = (optionIndex: number) => {
    const newOptions = (question.options || []).filter(
      (_, i) => i !== optionIndex
    );
    // Adjust correct answer if needed
    let newCorrectAnswer = question.correctAnswer;
    if (typeof newCorrectAnswer === "number") {
      if (optionIndex === newCorrectAnswer) {
        newCorrectAnswer = 0;
      } else if (optionIndex < newCorrectAnswer) {
        newCorrectAnswer = newCorrectAnswer - 1;
      }
    }
    onChange({
      ...question,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    });
  };

  // Update correct answer
  const handleCorrectAnswerChange = (value: string | number) => {
    onChange({ ...question, correctAnswer: value });
  };

  // Update explanation
  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ ...question, explanation: e.target.value });
  };

  // Update timestamp
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onChange({ ...question, timestamp: undefined });
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        onChange({ ...question, timestamp: numValue });
      }
    }
  };

  return (
    <Card className={cn(errors?.question && "border-destructive")}>
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

          {/* Title and type badge */}
          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium">Question {index}</span>
            <Badge variant="secondary" className="text-xs">
              {QUESTION_TYPE_LABELS[question.type]}
            </Badge>
            {question.timestamp !== undefined && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimestamp(question.timestamp)}
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
            disabled={isOnly}
            aria-label={`Delete question ${index}`}
            title={
              isOnly ? "At least one question is required" : "Delete question"
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Question Text and Timestamp - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Question Text */}
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor={`question-${index}-text`}>
                Question <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id={`question-${index}-text`}
                value={question.question}
                onChange={handleQuestionTextChange}
                placeholder="Enter your question..."
                rows={2}
                maxLength={1000}
                aria-invalid={!!errors?.question}
              />
              {errors?.question && (
                <p className="text-sm text-destructive">{errors.question}</p>
              )}
            </div>

            {/* Timestamp */}
            <div className="space-y-2">
              <Label htmlFor={`question-${index}-timestamp`}>
                Timestamp{" "}
                <span className="text-muted-foreground">(seconds)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id={`question-${index}-timestamp`}
                  type="number"
                  min={0}
                  max={audioDuration || 99999}
                  value={question.timestamp ?? ""}
                  onChange={handleTimestampChange}
                  placeholder="0"
                  className="w-full"
                />
              </div>
              {audioDuration && question.timestamp !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(question.timestamp)} /{" "}
                  {formatTimestamp(audioDuration)}
                </p>
              )}
              {errors?.timestamp && (
                <p className="text-sm text-destructive">{errors.timestamp}</p>
              )}
            </div>
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor={`question-${index}-type`}>
              Question Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={question.type}
              onValueChange={(v) => handleTypeChange(v as typeof question.type)}
            >
              <SelectTrigger id={`question-${index}-type`}>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Multiple Choice Options */}
          {question.type === "multiple_choice" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Options <span className="text-destructive">*</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    (2-6 options, click radio to set correct answer)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={(question.options?.length || 0) >= 6}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    {/* Radio button for correct answer */}
                    <input
                      type="radio"
                      name={`question-${index}-correct`}
                      checked={question.correctAnswer === optionIndex}
                      onChange={() => handleCorrectAnswerChange(optionIndex)}
                      className="h-4 w-4 text-primary"
                      aria-label={`Mark option ${optionIndex + 1} as correct`}
                    />
                    {/* Option input */}
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(optionIndex, e.target.value)
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                      className={cn(
                        "flex-1",
                        question.correctAnswer === optionIndex &&
                        "border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-600"
                      )}
                    />
                    {/* Remove option */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveOption(optionIndex)}
                      disabled={(question.options?.length || 0) <= 2}
                      aria-label={`Remove option ${optionIndex + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {errors?.options && (
                <p className="text-sm text-destructive">{errors.options}</p>
              )}
              {errors?.correctAnswer && (
                <p className="text-sm text-destructive">
                  {errors.correctAnswer}
                </p>
              )}
            </div>
          )}

          {/* True/False Answer */}
          {question.type === "true_false" && (
            <div className="space-y-2">
              <Label>
                Correct Answer <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}-tf`}
                    checked={
                      String(question.correctAnswer).toLowerCase() === "true"
                    }
                    onChange={() => handleCorrectAnswerChange("true")}
                    className="h-4 w-4 text-primary"
                  />
                  <span>True</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}-tf`}
                    checked={
                      String(question.correctAnswer).toLowerCase() === "false"
                    }
                    onChange={() => handleCorrectAnswerChange("false")}
                    className="h-4 w-4 text-primary"
                  />
                  <span>False</span>
                </label>
              </div>
              {errors?.correctAnswer && (
                <p className="text-sm text-destructive">
                  {errors.correctAnswer}
                </p>
              )}
            </div>
          )}

          {/* Fill in the Blank Answer */}
          {question.type === "fill_blank" && (
            <div className="space-y-2">
              <Label htmlFor={`question-${index}-answer`}>
                Expected Answer <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`question-${index}-answer`}
                value={String(question.correctAnswer)}
                onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                placeholder="Enter the word or phrase to fill in..."
              />
              <p className="text-xs text-muted-foreground">
                Use ___ (underscores) in the question to indicate where the
                blank is. The learner's answer will be compared to this text.
              </p>
              {errors?.correctAnswer && (
                <p className="text-sm text-destructive">
                  {errors.correctAnswer}
                </p>
              )}
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor={`question-${index}-explanation`}>
              Explanation{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id={`question-${index}-explanation`}
              value={question.explanation || ""}
              onChange={handleExplanationChange}
              placeholder="Explain why this is the correct answer..."
              rows={2}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              Shown to learners after they answer the question.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default ListeningQuestionEditor;
