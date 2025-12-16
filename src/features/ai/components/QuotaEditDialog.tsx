/**
 * QuotaEditDialog Component
 * Dialog for editing user AI quota limits
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { UserAIQuota, UpdateQuotaInput } from "../types";

/**
 * Validation schema for quota form
 */
const quotaFormSchema = z.object({
  rolePlayDailyLimit: z
    .number()
    .min(0, "Must be at least 0")
    .max(1000, "Maximum 1000"),
  grammarDailyLimit: z
    .number()
    .min(0, "Must be at least 0")
    .max(1000, "Maximum 1000"),
  flashcardDailyLimit: z
    .number()
    .min(0, "Must be at least 0")
    .max(1000, "Maximum 1000"),
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
      rolePlayDailyLimit: quota?.rolePlayDailyLimit ?? 20,
      grammarDailyLimit: quota?.grammarDailyLimit ?? 50,
      flashcardDailyLimit: quota?.flashcardDailyLimit ?? 20,
      isUnlimited: quota?.isUnlimited ?? false,
    },
    values: quota
      ? {
          rolePlayDailyLimit: quota.rolePlayDailyLimit,
          grammarDailyLimit: quota.grammarDailyLimit,
          flashcardDailyLimit: quota.flashcardDailyLimit,
          isUnlimited: quota.isUnlimited,
        }
      : undefined,
  });

  const isUnlimited = form.watch("isUnlimited");

  const handleSubmit = (values: QuotaFormValues) => {
    if (!quota) return;
    onSubmit(quota.userId, {
      rolePlayDailyLimit: values.rolePlayDailyLimit,
      grammarDailyLimit: values.grammarDailyLimit,
      flashcardDailyLimit: values.flashcardDailyLimit,
      isUnlimited: values.isUnlimited,
    });
  };

  if (!quota) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit AI Quota</DialogTitle>
          <DialogDescription>
            Update daily AI usage limits for {quota.userFullName} (
            {quota.userEmail})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Unlimited Toggle */}
            <FormField
              control={form.control}
              name="isUnlimited"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Unlimited Access</FormLabel>
                    <FormDescription>
                      Remove all daily limits for this user
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
              <FormField
                control={form.control}
                name="rolePlayDailyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role-Play Daily Limit</FormLabel>
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
                      Maximum role-play scenarios per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grammarDailyLimit"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Grammar Daily Limit</FormLabel>
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
                      Maximum grammar exercises per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flashcardDailyLimit"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Flashcard Daily Limit</FormLabel>
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
                      Maximum flashcard generations per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Current Usage Info */}
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-2">Current Usage Today:</p>
              <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                <div>
                  <span className="block text-foreground font-medium">
                    {quota.rolePlayUsedToday}
                  </span>
                  Role-Play
                </div>
                <div>
                  <span className="block text-foreground font-medium">
                    {quota.grammarUsedToday}
                  </span>
                  Grammar
                </div>
                <div>
                  <span className="block text-foreground font-medium">
                    {quota.flashcardUsedToday}
                  </span>
                  Flashcard
                </div>
              </div>
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
