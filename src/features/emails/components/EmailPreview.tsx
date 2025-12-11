/**
 * Email Preview Component
 * Displays a preview of the email content before sending
 */

import { Mail, User, Tag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EmailType, EmailPriority } from "../types/email.types";
import {
  EMAIL_TYPE_LABELS,
  EMAIL_PRIORITY_LABELS,
} from "../types/email.types";

interface EmailPreviewProps {
  emailType: EmailType;
  priority: EmailPriority;
  subject?: string;
  recipientEmail?: string;
  recipientName?: string;
  templateData?: {
    title?: string;
    message?: string;
    ctaText?: string;
    ctaUrl?: string;
  };
  mode?: "targeted" | "broadcast";
}

export function EmailPreview({
  emailType,
  priority,
  subject,
  recipientEmail,
  recipientName,
  templateData,
  mode = "targeted",
}: EmailPreviewProps) {
  // Default subject if not provided
  const displaySubject =
    subject || EMAIL_TYPE_LABELS[emailType] || "Email Subject";

  return (
    <Card className="border-2 border-dashed">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Email Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {EMAIL_TYPE_LABELS[emailType]}
            </Badge>
            <Badge
              variant={priority === "CRITICAL" || priority === "HIGH" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {EMAIL_PRIORITY_LABELS[priority]}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Recipient Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">To:</span>
            {mode === "broadcast" ? (
              <span className="text-muted-foreground">
                All Active Users (Broadcast)
              </span>
            ) : recipientEmail ? (
              <span className="text-muted-foreground">
                {recipientName && `${recipientName} <`}
                {recipientEmail}
                {recipientName && ">"}
              </span>
            ) : (
              <span className="text-muted-foreground italic">
                [User IDs will be resolved]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Subject:</span>
            <span className="text-muted-foreground">{displaySubject}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Scheduled:</span>
            <span className="text-muted-foreground">
              Immediately (will be queued)
            </span>
          </div>
        </div>

        <Separator />

        {/* Email Body Preview */}
        <div className="rounded-lg bg-white dark:bg-gray-900 border p-6 space-y-4">
          {/* Email Header */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  LEXIA Platform
                </p>
                <p className="text-sm text-gray-500">
                  noreply@lexia-platform.com
                </p>
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            {templateData?.title && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {templateData.title}
              </h2>
            )}

            {templateData?.message && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {templateData.message}
              </div>
            )}

            {!templateData?.title && !templateData?.message && (
              <div className="text-gray-500 dark:text-gray-400 italic">
                [Email content will be generated from template: {emailType}]
              </div>
            )}

            {templateData?.ctaText && templateData?.ctaUrl && (
              <div className="pt-4">
                <a
                  href={templateData.ctaUrl}
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  {templateData.ctaText}
                </a>
              </div>
            )}
          </div>

          {/* Email Footer */}
          <div className="border-t pt-4 mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>
              You're receiving this email because you have an account on LEXIA
              Platform.
            </p>
            <p className="mt-2">
              © 2025 LEXIA Platform. All rights reserved.
            </p>
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 text-sm">
          <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            This is a preview. The actual email will include additional styling,
            branding, and dynamic content based on the template.
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Compact Email Preview for Confirmation Dialog
 */
interface CompactEmailPreviewProps {
  emailType: EmailType;
  subject?: string;
  templateData?: {
    title?: string;
    message?: string;
  };
  mode?: "targeted" | "broadcast";
  recipientCount?: number;
}

export function CompactEmailPreview({
  emailType,
  subject,
  templateData,
  mode = "targeted",
  recipientCount,
}: CompactEmailPreviewProps) {
  const displaySubject =
    subject || EMAIL_TYPE_LABELS[emailType] || "Email Subject";

  return (
    <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Subject:</span>
          <Badge variant="outline" className="text-xs">
            {EMAIL_TYPE_LABELS[emailType]}
          </Badge>
        </div>
        <p className="font-semibold text-sm">{displaySubject}</p>
      </div>

      {(templateData?.title || templateData?.message) && (
        <>
          <Separator />
          <div className="space-y-2">
            {templateData?.title && (
              <p className="font-medium text-sm">{templateData.title}</p>
            )}
            {templateData?.message && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {templateData.message}
              </p>
            )}
          </div>
        </>
      )}

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {mode === "broadcast"
            ? "All Active Users"
            : recipientCount
            ? `${recipientCount} recipient${recipientCount > 1 ? "s" : ""}`
            : "Targeted users"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Queued immediately
        </span>
      </div>
    </div>
  );
}
