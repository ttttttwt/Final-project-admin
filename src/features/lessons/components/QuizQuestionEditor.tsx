/**
 * Quiz Question Editor Component
 * Editor for adding/editing quiz questions with points, hints, and multiple question types
 */

import { useState } from "react";
import {
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Lightbulb,
  Award,
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
import type {
  QuizQuestionFormData,
  QuizQuestionType,
} from "../schemas/quizLesson.schema";

/** Question type labels */
const QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True/False",
  fill_blank: "Fill in the Blank",
  matching: "Matching",
};

/** Question type descriptions */
const QUESTION_TYPE_DESCRIPTIONS: Record<QuizQuestionType, string> = {
  multiple_choice: "Select one correct answer from options",
  true_false: "Answer is either true or false",
  fill_blank: "Fill in the missing word or phrase",
  matching: "Match items from two columns",
};

interface QuizQuestionEditorProps {
  /** Question data */
  question: QuizQuestionFormData;
  /** Question index (1-based for display) */
  index: number;
  /** Whether this is the only question (can't delete) */
  isOnly: boolean;
  /** Callback when question is updated */
  onChange: (question: QuizQuestionFormData) => void;
  /** Callback when question is deleted */
  onDelete: () => void;
  /** Error messages for fields */
  errors?: {
    question?: string;
    type?: string;
    options?: string;
    correctAnswer?: string;
    points?: string;
    hint?: string;
  };
}

/**
 * QuizQuestionEditor - Edit a single quiz question with type-specific fields
 */
export function QuizQuestionEditor({
  question,
  index,
  isOnly,
  onChange,
  onDelete,
  errors,
}: QuizQuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Update question text
  const handleQuestionTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ ...question, question: e.target.value });
  };

  // Update question type
  const handleTypeChange = (type: QuizQuestionType) => {
    const newQuestion = { ...question, type };

    // Reset options and correct answer based on type
    if (type === "multiple_choice") {
      newQuestion.options =
        question.options?.length && question.options.length >= 2
          ? question.options
          : ["", ""];
      newQuestion.correctAnswer = 0;
    } else if (type === "true_false") {
      newQuestion.options = undefined;
      newQuestion.correctAnswer = "true";
    } else if (type === "fill_blank") {
      newQuestion.options = undefined;
      newQuestion.correctAnswer = "";
    } else if (type === "matching") {
      // Matching: needs pairs (left1, right1, left2, right2...)
      newQuestion.options =
        question.options?.length && question.options.length >= 4
          ? question.options
          : ["", "", "", ""];
      // Correct answer for matching is array of pairs: ["0-0", "1-1"] meaning left[0] matches right[0]
      newQuestion.correctAnswer = ["0-0", "1-1"];
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
    if (question.type === "matching") {
      // Add pair for matching (2 options)
      const newOptions = [...(question.options || []), "", ""];
      onChange({ ...question, options: newOptions });
    } else {
      const newOptions = [...(question.options || []), ""];
      onChange({ ...question, options: newOptions });
    }
  };

  // Remove option at index
  const handleRemoveOption = (optionIndex: number) => {
    if (question.type === "matching") {
      // Remove pair for matching (2 options)
      const pairStart = Math.floor(optionIndex / 2) * 2;
      const newOptions = (question.options || []).filter(
        (_, i) => i !== pairStart && i !== pairStart + 1
      );
      // Update correct answers
      const numPairs = newOptions.length / 2;
      const newCorrectAnswer = Array.from(
        { length: numPairs },
        (_, i) => `${i}-${i}`
      );
      onChange({
        ...question,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      });
    } else {
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
    }
  };

  // Update correct answer
  const handleCorrectAnswerChange = (value: string | number) => {
    onChange({ ...question, correctAnswer: value });
  };

  // Update points
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value, 10);
    onChange({ ...question, points: isNaN(points) ? 1 : points });
  };

  // Update hint
  const handleHintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...question, hint: e.target.value });
  };

  // Update explanation
  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ ...question, explanation: e.target.value });
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

          {/* Title, type badge, and points */}
          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium">Question {index}</span>
            <Badge variant="secondary" className="text-xs">
              {QUESTION_TYPE_LABELS[question.type]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Award className="h-3 w-3 mr-1" />
              {question.points || 1} pt{(question.points || 1) !== 1 && "s"}
            </Badge>
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
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor={`quiz-question-${index}-text`}>
              Question <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`quiz-question-${index}-text`}
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

          {/* Question Type and Points Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Question Type */}
            <div className="space-y-2">
              <Label htmlFor={`quiz-question-${index}-type`}>
                Question Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={question.type}
                onValueChange={(v) => handleTypeChange(v as QuizQuestionType)}
              >
                <SelectTrigger id={`quiz-question-${index}-type`}>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">
                    <div>
                      <span>Multiple Choice</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="true_false">
                    <div>
                      <span>True/False</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fill_blank">
                    <div>
                      <span>Fill in the Blank</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="matching">
                    <div>
                      <span>Matching</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {QUESTION_TYPE_DESCRIPTIONS[question.type]}
              </p>
            </div>

            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor={`quiz-question-${index}-points`}>
                Points <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`quiz-question-${index}-points`}
                type="number"
                min={1}
                max={100}
                value={question.points || 1}
                onChange={handlePointsChange}
                className="w-full"
              />
              {errors?.points && (
                <p className="text-sm text-destructive">{errors.points}</p>
              )}
            </div>
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
                      name={`quiz-question-${index}-correct`}
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
                          "border-green-500 bg-green-50 dark:bg-green-950"
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
                    name={`quiz-question-${index}-tf`}
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
                    name={`quiz-question-${index}-tf`}
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
              <Label htmlFor={`quiz-question-${index}-answer`}>
                Expected Answer <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`quiz-question-${index}-answer`}
                value={String(question.correctAnswer)}
                onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                placeholder="Enter the expected answer..."
              />
              <p className="text-xs text-muted-foreground">
                Use underscore (___) in the question to indicate where the blank
                is. The learner's answer will be compared to this text.
              </p>
              {errors?.correctAnswer && (
                <p className="text-sm text-destructive">
                  {errors.correctAnswer}
                </p>
              )}
            </div>
          )}

          {/* Matching Pairs */}
          {question.type === "matching" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Matching Pairs <span className="text-destructive">*</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    (Minimum 2 pairs)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={(question.options?.length || 0) >= 12}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Pair
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Left Column
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  Right Column (Match)
                </span>
              </div>

              <div className="space-y-2">
                {question.options &&
                  Array.from({
                    length: Math.floor(question.options.length / 2),
                  }).map((_, pairIndex) => {
                    const leftIndex = pairIndex * 2;
                    const rightIndex = pairIndex * 2 + 1;
                    return (
                      <div key={pairIndex} className="flex items-center gap-2">
                        {/* Left item */}
                        <Input
                          value={question.options?.[leftIndex] || ""}
                          onChange={(e) =>
                            handleOptionChange(leftIndex, e.target.value)
                          }
                          placeholder={`Item ${pairIndex + 1}`}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">→</span>
                        {/* Right item (match) */}
                        <Input
                          value={question.options?.[rightIndex] || ""}
                          onChange={(e) =>
                            handleOptionChange(rightIndex, e.target.value)
                          }
                          placeholder={`Match ${pairIndex + 1}`}
                          className="flex-1"
                        />
                        {/* Remove pair */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveOption(leftIndex)}
                          disabled={(question.options?.length || 0) <= 4}
                          aria-label={`Remove pair ${pairIndex + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <p className="text-xs text-muted-foreground">
                Items will be shuffled when displayed to learners. Each left
                item matches with its corresponding right item.
              </p>

              {errors?.options && (
                <p className="text-sm text-destructive">{errors.options}</p>
              )}
            </div>
          )}

          {/* Hint */}
          <div className="space-y-2">
            <Label htmlFor={`quiz-question-${index}-hint`}>
              <Lightbulb className="h-4 w-4 inline mr-1" />
              Hint <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id={`quiz-question-${index}-hint`}
              value={question.hint || ""}
              onChange={handleHintChange}
              placeholder="Provide a hint to help learners..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Hint can be shown to learners if they request help.
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor={`quiz-question-${index}-explanation`}>
              Explanation{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id={`quiz-question-${index}-explanation`}
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

export default QuizQuestionEditor;
