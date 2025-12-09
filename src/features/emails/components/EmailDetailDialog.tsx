/**
 * Email Detail Dialog Component
 * Shows detailed information about a specific email
 */

import { format } from "date-fns";
import { Mail, User, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { EmailQueueDTO, EmailStatus } from "../types/email.types";
import {
  EMAIL_STATUS_LABELS,
  EMAIL_TYPE_LABELS,
  EMAIL_PRIORITY_LABELS,
} from "../types/email.types";

interface EmailDetailDialogProps {
  email: EmailQueueDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Status colors
const statusColors: Record<EmailStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  SENT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  BOUNCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

// Status icons
const StatusIcon = ({ status }: { status: EmailStatus }) => {
  switch (status) {
    case "DELIVERED":
    case "SENT":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "FAILED":
    case "BOUNCED":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "PENDING":
    case "PROCESSING":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export function EmailDetailDialog({
  email,
  open,
  onOpenChange,
}: EmailDetailDialogProps) {
  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Details
          </DialogTitle>
          <DialogDescription>
            ID: {email.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon status={email.status} />
              <Badge className={statusColors[email.status]}>
                {EMAIL_STATUS_LABELS[email.status]}
              </Badge>
            </div>
            <Badge variant="outline">
              {EMAIL_PRIORITY_LABELS[email.priority]}
            </Badge>
          </div>

          <Separator />

          {/* Recipient Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Recipient
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{email.recipientName || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{email.recipientEmail}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Email Content Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Content
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">
                  {EMAIL_TYPE_LABELS[email.emailType] || email.emailType}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">{email.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Template</p>
                <p className="font-medium font-mono text-sm">{email.templateName}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timing Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(email.createdAt), "PPp")}
                </p>
              </div>
              {email.sentAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="font-medium">
                    {format(new Date(email.sentAt), "PPp")}
                  </p>
                </div>
              )}
              {email.deliveredAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="font-medium">
                    {format(new Date(email.deliveredAt), "PPp")}
                  </p>
                </div>
              )}
              {email.nextRetryAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Next Retry</p>
                  <p className="font-medium">
                    {format(new Date(email.nextRetryAt), "PPp")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Retry Info */}
          {email.attempts > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Retry Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Attempts</p>
                    <p className="font-medium">
                      {email.attempts} / {email.maxAttempts}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error Section */}
          {email.lastError && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Last Error
                </h4>
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive font-mono">
                    {email.lastError}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
