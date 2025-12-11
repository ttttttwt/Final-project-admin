/**
 * Email Preview Component
 * Displays a preview of the email content before sending
 * 
 * This preview mirrors the actual email template structure from the backend:
 * - Backend templates: src/main/resources/templates/email/
 * - Base layout: email/base/layout.html
 * - Content templates: email/system/announcement.html, email/system/maintenance.html, etc.
 */

import { Mail, User, Tag, Clock, AlertTriangle, Wrench, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EmailType, EmailPriority } from "../types/email.types";
import {
  EMAIL_TYPE_LABELS,
  EMAIL_PRIORITY_LABELS,
} from "../types/email.types";

/**
 * Template data fields that map to backend Thymeleaf variables
 * 
 * SYSTEM_ANNOUNCEMENT template expects:
 * - announcementTitle: Title of the announcement
 * - announcementContent: Main content (supports HTML)
 * - actionUrl: CTA button URL
 * - actionButtonText: CTA button text
 * - actionRequired: Boolean to show action required warning
 * - actionRequiredMessage: Message for action required section
 * 
 * MAINTENANCE_NOTICE template expects:
 * - startTime: Maintenance start time
 * - endTime: Maintenance end time
 * - duration: Duration string (e.g., "~2 hours")
 * - whatToExpect: Array of items
 * - improvements: Array of improvement items
 * - statusPageUrl: Optional status page URL
 * 
 * Common variables (added by backend):
 * - userName: Recipient's name
 * - dashboardUrl, preferencesUrl, unsubscribeUrl
 */
interface TemplateData {
  // SYSTEM_ANNOUNCEMENT fields
  title?: string;           // Maps to announcementTitle in backend
  message?: string;         // Maps to announcementContent in backend
  ctaText?: string;         // Maps to actionButtonText in backend
  ctaUrl?: string;          // Maps to actionUrl in backend
  actionRequired?: boolean;
  actionRequiredMessage?: string;
  
  // MAINTENANCE_NOTICE fields
  startTime?: string;
  endTime?: string;
  duration?: string;
}

interface EmailPreviewProps {
  emailType: EmailType;
  priority: EmailPriority;
  subject?: string;
  recipientEmail?: string;
  recipientName?: string;
  templateData?: TemplateData;
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

  // Get the appropriate icon for email type
  const getEmailIcon = () => {
    switch (emailType) {
      case "MAINTENANCE_NOTICE":
        return <Wrench className="h-5 w-5 text-primary" />;
      case "SECURITY_ALERT":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Mail className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getEmailIcon()}
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

        {/* Email Body Preview - Matches backend base/layout.html structure */}
        <div className="rounded-lg bg-white dark:bg-gray-900 border-2 border-dashed overflow-hidden">
          {/* Email Header - Matches backend header */}
          <div className="border-b p-6">
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

          {/* Email Content - Template-specific rendering */}
          <div className="p-6 space-y-4">
            {emailType === "MAINTENANCE_NOTICE" ? (
              // MAINTENANCE_NOTICE template preview
              <MaintenancePreview templateData={templateData} />
            ) : emailType === "SYSTEM_ANNOUNCEMENT" ? (
              // SYSTEM_ANNOUNCEMENT template preview
              <AnnouncementPreview templateData={templateData} />
            ) : (
              // Generic template preview
              <GenericPreview emailType={emailType} templateData={templateData} />
            )}
          </div>

          {/* Email Footer - Matches backend footer */}
          <div className="border-t p-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
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
            This preview matches the actual email template structure. Dynamic variables
            like user name will be populated when sending.
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * SYSTEM_ANNOUNCEMENT template preview
 * Maps to backend: email/system/announcement.html
 */
function AnnouncementPreview({ templateData }: { templateData?: TemplateData }) {
  return (
    <>
      <div className="text-center text-6xl mb-4">📢</div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
        {templateData?.title || "📢 Important Announcement"}
      </h1>

      <p className="text-gray-700 dark:text-gray-300">
        Hi <strong>[User Name]</strong>,
      </p>

      {templateData?.message ? (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {templateData.title || "Announcement"}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {templateData.message}
          </div>
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 italic">
          [Announcement content will be filled here]
        </div>
      )}

      {templateData?.actionRequired && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            ⚠️ Action Required
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            {templateData.actionRequiredMessage || "Please take action before the deadline."}
          </p>
        </div>
      )}

      {templateData?.ctaText && templateData?.ctaUrl && (
        <div className="text-center pt-4">
          <a
            href={templateData.ctaUrl}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            {templateData.ctaText}
          </a>
        </div>
      )}
    </>
  );
}

/**
 * MAINTENANCE_NOTICE template preview
 * Maps to backend: email/system/maintenance.html
 */
function MaintenancePreview({ templateData }: { templateData?: TemplateData }) {
  return (
    <>
      <div className="text-center text-6xl mb-4">🔧</div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
        🔧 Scheduled Maintenance
      </h1>

      <p className="text-gray-700 dark:text-gray-300">
        Hi <strong>[User Name]</strong>,
      </p>

      <p className="text-gray-600 dark:text-gray-400">
        We'll be performing maintenance to improve your experience.
      </p>

      {/* Maintenance Window Card */}
      <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4">
        <h3 className="font-semibold text-center text-gray-900 dark:text-gray-100 mb-3">
          ⏰ Maintenance Window
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Start Time</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {templateData?.startTime || "[Start Time]"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">End Time</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {templateData?.endTime || "[End Time]"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Duration</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {templateData?.duration || "[Duration]"}
            </span>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          📋 What to Expect
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
          <li>The platform may be temporarily unavailable</li>
          <li>Your progress will be saved automatically</li>
          <li>No action is required from you</li>
        </ul>
      </div>
    </>
  );
}

/**
 * Generic template preview for other email types
 */
function GenericPreview({ 
  emailType, 
  templateData 
}: { 
  emailType: EmailType;
  templateData?: TemplateData;
}) {
  return (
    <>
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
    </>
  );
}

/**
 * Compact Email Preview for Confirmation Dialog
 * Shows a condensed version for confirmation before sending
 */
interface CompactEmailPreviewProps {
  emailType: EmailType;
  subject?: string;
  templateData?: TemplateData;
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

  // Get type-specific summary
  const getTypeSummary = () => {
    if (emailType === "MAINTENANCE_NOTICE" && templateData) {
      const parts: string[] = [];
      if (templateData.startTime) parts.push(`Start: ${templateData.startTime}`);
      if (templateData.duration) parts.push(`Duration: ${templateData.duration}`);
      return parts.length > 0 ? parts.join(" • ") : null;
    }
    return null;
  };

  const typeSummary = getTypeSummary();

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

      {(templateData?.title || templateData?.message || typeSummary) && (
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
            {typeSummary && (
              <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {typeSummary}
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
