/**
 * QuotaEditDialog Component
 * Dialog for editing user AI quota limits with subscription awareness
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import type { UserAIQuota, UpdateQuotaInput } from "../types";
import { isPro } from "../types";
import { PlanBadge } from "./PlanBadge";

/**
 * Validation schema for quota form
 */
const quotaFormSchema = z.object({
  roleplayLimit: z
    .number()
    .min(0, "Must be at least 0")
    .max(1000, "Maximum 1000"),
  grammarLimit: z
    .number()
    .min(0, "Must be at least 0")
    .max(1000, "Maximum 1000"),
  flashcardLimit: z
    .number()
    .min(0, "Must be at least 0")
    .max(1000, "Maximum 1000"),
  customMaterialsLimit: z
    .number()
    .min(0, "Must be at least 0")
    .max(100, "Maximum 100"),
  isUnlimited: z.boolean(),
});

type QuotaFormValues = z.infer<typeof quotaFormSchema>;

interface QuotaEditDialogProps {
  quota: UserAIQuota | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, data: UpdateQuotaInput) => void;
  isSubmitting: boolean;
}

/**
 * Usage progress bar component
 */
function UsageProgress({ used, limit, label }: { used: number; limit: number; label: string }) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={isCritical ? "text-destructive font-medium" : isWarning ? "text-yellow-600" : ""}>
          {used}/{limit} ({Math.round(percentage)}%)
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isCritical ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-yellow-500" : ""}`}
      />
    </div>
  );
}

export function QuotaEditDialog({
  quota,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: QuotaEditDialogProps) {
  const form = useForm<QuotaFormValues>({
    resolver: zodResolver(quotaFormSchema),
    defaultValues: {
      roleplayLimit: quota?.roleplaySessionsLimit ?? 10,
      grammarLimit: quota?.grammarExercisesLimit ?? 75,
      flashcardLimit: quota?.flashcardDecksLimit ?? 10,
      isUnlimited: quota?.isUnlimited ?? false,
    },
    values: quota
      ? {
        roleplayLimit: quota.roleplaySessionsLimit,
        grammarLimit: quota.grammarExercisesLimit,
        flashcardLimit: quota.flashcardDecksLimit,
        customMaterialsLimit: quota.customMaterialsLimit,
        isUnlimited: quota.isUnlimited,
      }
      : undefined,
  });

  const isUnlimited = form.watch("isUnlimited");

  const handleSubmit = (values: QuotaFormValues) => {
    if (!quota) return;
    onSubmit(quota.userId, {
      rolePlayDailyLimit: values.roleplayLimit,
      grammarDailyLimit: values.grammarLimit,
      flashcardDailyLimit: values.flashcardLimit,
      customMaterialsLimit: values.customMaterialsLimit,
      isUnlimited: values.isUnlimited,
    });
  };

  if (!quota) return null;

  const isProUser = isPro(quota.planType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit AI Quota
            <PlanBadge planType={quota.planType} />
          </DialogTitle>
          <DialogDescription>
            Update monthly AI usage limits for {quota.userFullName} ({quota.userEmail})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Plan Info Banner */}
            {isProUser && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800">
                <Crown className="h-5 w-5 text-amber-500" />
                <div className="text-sm">
                  <span className="font-medium text-amber-700 dark:text-amber-400">Pro User</span>
                  <span className="text-muted-foreground ml-1">— Higher default limits apply</span>
                </div>
              </div>
            )}

            {/* Unlimited Toggle */}
            <FormField
              control={form.control}
              name="isUnlimited"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Unlimited Access</FormLabel>
                    <FormDescription>
                      Remove all monthly limits for this user
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Quota Limits */}
            <div className={isUnlimited ? "opacity-50 pointer-events-none" : ""}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="roleplayLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role-Play Sessions (Monthly)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={isUnlimited}
                        />
                      </FormControl>
                      <FormDescription>
                        {isProUser ? "Pro default: 50 sessions/month" : "Free default: 10 sessions/month"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grammarLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grammar Exercises (Monthly)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={isUnlimited}
                        />
                      </FormControl>
                      <FormDescription>
                        {isProUser ? "Pro default: 300 exercises/month" : "Free default: 75 exercises/month"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flashcardLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flashcard Decks (Monthly)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={isUnlimited}
                        />
                      </FormControl>
                      <FormDescription>
                        {isProUser ? "Pro default: 30 decks/month" : "Free default: 10 decks/month"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customMaterialsLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Materials (Monthly)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={isUnlimited}
                        />
                      </FormControl>
                      <FormDescription>
                        {isProUser ? "Pro default: 10 materials/month" : "Free default: 10 materials/month"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Current Usage Info */}
            <div className="rounded-lg bg-muted p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Current Monthly Usage</p>
                {quota.daysUntilReset !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Resets in {quota.daysUntilReset} days
                  </span>
                )}
              </div>
              <UsageProgress
                used={quota.roleplaySessionsUsed}
                limit={quota.roleplaySessionsLimit}
                label="Role-Play"
              />
              <UsageProgress
                used={quota.grammarExercisesUsed}
                limit={quota.grammarExercisesLimit}
                label="Grammar"
              />
              <UsageProgress
                used={quota.flashcardDecksUsed}
                limit={quota.flashcardDecksLimit}
                label="Flashcards"
              />
              <UsageProgress
                used={quota.customMaterialsUsed}
                limit={quota.customMaterialsLimit}
                label="Materials"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default QuotaEditDialog;
