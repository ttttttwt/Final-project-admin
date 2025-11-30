/**
 * BroadcastForm Component
 *
 * Form for sending broadcast notifications to all users.
 * Uses React Hook Form with Zod validation.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  NOTIFICATION_TYPES,
  PRIORITY_OPTIONS,
  getNotificationIcon,
  type NotificationType,
  type NotificationPriority,
} from "@/types/notification.types";
import { useBroadcastNotification } from "../hooks/useNotifications";

// Form validation schema
const broadcastFormSchema = z.object({
  type: z.enum(
    [
      "SYSTEM_ANNOUNCEMENT",
      "MAINTENANCE_NOTICE",
      "COURSE_PUBLISHED",
      "LESSON_ADDED",
      "ENROLLMENT_CONFIRMED",
      "LESSON_COMPLETED",
      "COURSE_COMPLETED",
      "ACHIEVEMENT_UNLOCKED",
      "STREAK_REMINDER",
      "STREAK_LOST",
      "STREAK_MILESTONE",
      "LEVEL_UP",
    ] as const,
    {
      message: "Please select a notification type",
    }
  ),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
  priority: z.enum(["HIGH", "NORMAL", "LOW"] as const, {
    message: "Please select a priority",
  }),
});

type BroadcastFormValues = z.infer<typeof broadcastFormSchema>;

const defaultValues: Partial<BroadcastFormValues> = {
  type: "SYSTEM_ANNOUNCEMENT",
  priority: "NORMAL",
  title: "",
  message: "",
};

export function BroadcastForm() {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const broadcastMutation = useBroadcastNotification();

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (_data: BroadcastFormValues) => {
    // Show confirmation dialog before sending
    setShowConfirmDialog(true);
  };

  const handleConfirmBroadcast = async () => {
    const data = form.getValues();
    await broadcastMutation.mutateAsync({
      type: data.type as NotificationType,
      title: data.title,
      message: data.message,
      priority: data.priority as NotificationPriority,
    });
    setShowConfirmDialog(false);
    form.reset(defaultValues);
  };

  const selectedType = form.watch("type");
  const selectedPriority = form.watch("priority");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Broadcast Notification
          </CardTitle>
          <CardDescription>
            Send a notification to all active users on the platform. Use this
            for important announcements or system-wide messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Notification Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NOTIFICATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{getNotificationIcon(type.value)}</span>
                              <span>{type.label}</span>
                              <span className="text-xs text-muted-foreground">
                                ({type.category})
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of notification. System announcements and
                      maintenance notices are recommended for broadcasts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span
                              className={
                                option.value === "HIGH"
                                  ? "text-destructive font-medium"
                                  : option.value === "LOW"
                                  ? "text-muted-foreground"
                                  : ""
                              }
                            >
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      High priority notifications are delivered in real-time via
                      WebSocket and shown as toasts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Scheduled Maintenance Tonight"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A short, descriptive title for the notification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the notification message..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main content of the notification. Keep it concise and
                      informative.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview */}
              {(form.watch("title") || form.watch("message")) && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="flex gap-3">
                    <span className="text-xl">
                      {getNotificationIcon(selectedType as NotificationType)}
                    </span>
                    <div>
                      <p className="font-medium">
                        {form.watch("title") || "Title"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {form.watch("message") || "Message"}
                      </p>
                      {selectedPriority === "HIGH" && (
                        <span className="text-xs text-destructive font-medium">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={broadcastMutation.isPending}
              >
                {broadcastMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Broadcast
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Broadcast</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a notification to <strong>all active users</strong>{" "}
              on the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 rounded-lg border p-3 bg-muted/50">
            <p className="font-medium">{form.watch("title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {form.watch("message")}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBroadcast}
              disabled={broadcastMutation.isPending}
            >
              {broadcastMutation.isPending ? "Sending..." : "Confirm & Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
