/**
 * Send Email Dialog Component
 * Form to send emails to specific users or broadcast
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Users, Radio, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, EyeOff } from "lucide-react";
import type { AdminEmailRequest, EmailType, EmailPriority } from "../types/email.types";
import { EMAIL_TYPE_LABELS, EMAIL_PRIORITY_LABELS } from "../types/email.types";
import { EmailPreview, CompactEmailPreview } from "./EmailPreview";

// Validation schema
const sendEmailSchema = z.object({
  emailType: z.string().min(1, "Email type is required"),
  subject: z.string().max(255, "Subject must not exceed 255 characters").optional().or(z.literal("")),
  priority: z.string().optional().or(z.literal("")),
  userIds: z.string().optional().or(z.literal("")),
  locale: z.string().min(1),
  // Template data fields for SYSTEM_ANNOUNCEMENT
  title: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  ctaText: z.string().optional().or(z.literal("")),
  ctaUrl: z.string().optional().or(z.literal("")),
  // Template data fields for MAINTENANCE_NOTICE
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
});

type SendEmailFormData = z.infer<typeof sendEmailSchema>;

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendEmail: (request: AdminEmailRequest) => void;
  onBroadcastEmail: (request: AdminEmailRequest) => void;
  isSending: boolean;
  isBroadcasting: boolean;
}

// Email types suitable for admin sending
const ADMIN_EMAIL_TYPES: EmailType[] = [
  "SYSTEM_ANNOUNCEMENT",
  "MAINTENANCE_NOTICE",
  "WELCOME",
  "STREAK_REMINDER",
  "WEEKLY_PROGRESS",
];

export function SendEmailDialog({
  open,
  onOpenChange,
  onSendEmail,
  onBroadcastEmail,
  isSending,
  isBroadcasting,
}: SendEmailDialogProps) {
  const [mode, setMode] = useState<"targeted" | "broadcast">("targeted");
  const [confirmBroadcast, setConfirmBroadcast] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const form = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema) as never,
    defaultValues: {
      emailType: "SYSTEM_ANNOUNCEMENT",
      priority: "NORMAL",
      locale: "en",
      userIds: "",
      subject: "",
      title: "",
      message: "",
      ctaText: "",
      ctaUrl: "",
      startTime: "",
      endTime: "",
      duration: "",
    },
  });

  const handleSubmit = (data: SendEmailFormData) => {
    // Map form fields to template variables expected by backend
    const templateData: Record<string, unknown> = {};
    
    if (data.emailType === "MAINTENANCE_NOTICE") {
      // Maintenance template expects: startTime, endTime, duration
      if (data.startTime) templateData.startTime = data.startTime;
      if (data.endTime) templateData.endTime = data.endTime;
      if (data.duration) templateData.duration = data.duration;
      // Also support message for additional info
      if (data.message) templateData.message = data.message;
    } else {
      // SYSTEM_ANNOUNCEMENT template expects: announcementTitle, announcementContent, actionUrl, actionButtonText
      if (data.title) templateData.announcementTitle = data.title;
      if (data.message) templateData.announcementContent = data.message;
      if (data.ctaText) templateData.actionButtonText = data.ctaText;
      if (data.ctaUrl) templateData.actionUrl = data.ctaUrl;
    }

    const request: AdminEmailRequest = {
      emailType: data.emailType as EmailType,
      subject: data.subject || undefined,
      priority: (data.priority as EmailPriority) || "NORMAL",
      templateData,
      locale: data.locale,
    };

    if (mode === "broadcast") {
      if (!confirmBroadcast) {
        setConfirmBroadcast(true);
        return;
      }
      request.broadcast = true;
      onBroadcastEmail(request);
    } else {
      // Parse user IDs from comma-separated string
      const userIds = data.userIds
        ?.split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (!userIds || userIds.length === 0) {
        form.setError("userIds", { message: "At least one user ID is required" });
        return;
      }

      request.userIds = userIds;
      onSendEmail(request);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setConfirmBroadcast(false);
      setMode("targeted");
      setShowPreview(true);
    }
    onOpenChange(newOpen);
  };

  const isLoading = isSending || isBroadcasting;

  // Watch form values for preview
  const watchedValues = form.watch();
  const userIdsCount = watchedValues.userIds
    ?.split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0).length || 0;

  return (
    <>
      <Dialog open={open && !confirmBroadcast} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send emails to specific users or broadcast to all active users
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => {
          setMode(v as "targeted" | "broadcast");
          setConfirmBroadcast(false);
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="targeted" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Targeted
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Broadcast
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
              <TabsContent value="targeted" className="space-y-4 mt-0">
                <FormField
                  control={form.control}
                  name="userIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User IDs</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter user UUIDs, separated by commas..."
                          className="min-h-[80px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter one or more user UUIDs, separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="broadcast" className="space-y-4 mt-0">
                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-900">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This will send an email to ALL active users in the system.
                    Use with caution.
                  </p>
                </div>
              </TabsContent>

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emailType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ADMIN_EMAIL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {EMAIL_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.keys(EMAIL_PRIORITY_LABELS) as EmailPriority[]).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {EMAIL_PRIORITY_LABELS[priority]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Custom subject line..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use default subject from template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Template Data Section */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-sm">Template Variables</h4>
                
                {/* Fields for SYSTEM_ANNOUNCEMENT */}
                {watchedValues.emailType !== "MAINTENANCE_NOTICE" && (
                  <>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Announcement title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Main message content..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ctaText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CTA Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Learn More" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ctaUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CTA URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Fields for MAINTENANCE_NOTICE */}
                {watchedValues.emailType === "MAINTENANCE_NOTICE" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input placeholder="Dec 3, 2025 at 02:00 AM UTC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input placeholder="Dec 3, 2025 at 04:00 AM UTC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="~2 hours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional details about the maintenance..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Preview Section */}
              <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Show Preview
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-4">
                  <EmailPreview
                    emailType={watchedValues.emailType as EmailType}
                    priority={(watchedValues.priority as EmailPriority) || "NORMAL"}
                    subject={watchedValues.subject}
                    templateData={{
                      title: watchedValues.title,
                      message: watchedValues.message,
                      ctaText: watchedValues.ctaText,
                      ctaUrl: watchedValues.ctaUrl,
                      // Maintenance-specific fields
                      startTime: watchedValues.startTime,
                      endTime: watchedValues.endTime,
                      duration: watchedValues.duration,
                    }}
                    mode={mode}
                  />
                </CollapsibleContent>
              </Collapsible>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "broadcast"
                    ? confirmBroadcast
                      ? "Confirm Broadcast"
                      : "Send Broadcast"
                    : "Send Email"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>

    {/* Confirmation Dialog with Preview */}
    <AlertDialog open={confirmBroadcast} onOpenChange={setConfirmBroadcast}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === "broadcast" ? "Confirm Broadcast Email" : "Confirm Send Email"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "broadcast" ? (
              <>
                This will send an email to <strong>all active users</strong> on
                the platform. This action cannot be undone.
              </>
            ) : (
              <>
                This will send an email to <strong>{userIdsCount} user{userIdsCount > 1 ? "s" : ""}</strong>.
                Please review the preview below before confirming.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4">
          <CompactEmailPreview
            emailType={watchedValues.emailType as EmailType}
            subject={watchedValues.subject}
            templateData={{
              title: watchedValues.title,
              message: watchedValues.message,
              // Maintenance-specific fields for summary
              startTime: watchedValues.startTime,
              endTime: watchedValues.endTime,
              duration: watchedValues.duration,
            }}
            mode={mode}
            recipientCount={userIdsCount}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => form.handleSubmit(handleSubmit)()}
            disabled={isLoading}
            className={mode === "broadcast" ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>Confirm & Send</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
