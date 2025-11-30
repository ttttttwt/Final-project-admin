/**
 * Notifications Page
 *
 * Admin page for managing broadcast notifications.
 */

import { BroadcastForm } from "../components/BroadcastForm";
import { Bell, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Send announcements and system notifications to users.
          </p>
        </div>
      </div>

      {/* Warning Alert */}
      <Alert
        variant="destructive"
        className="border-destructive/50 bg-destructive/10"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Use with caution</AlertTitle>
        <AlertDescription>
          Broadcast notifications are sent to all active users immediately.
          Please review your message carefully before sending.
        </AlertDescription>
      </Alert>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Broadcast Form */}
        <div className="lg:col-span-1">
          <BroadcastForm />
        </div>

        {/* Tips & Guidelines */}
        <div className="lg:col-span-1 space-y-6">
          {/* Best Practices */}
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-4">📋 Best Practices</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Use <strong>System Announcement</strong> for general updates
                  and news.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Use <strong>Maintenance Notice</strong> for scheduled downtime
                  or technical updates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Set priority to <strong>High</strong> only for urgent or
                  time-sensitive messages.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Keep titles under 60 characters for better readability.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Include relevant details but keep messages concise (under 200
                  characters recommended).
                </span>
              </li>
            </ul>
          </div>

          {/* Priority Levels */}
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-4">⚡ Priority Levels</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-destructive text-destructive-foreground">
                  HIGH
                </span>
                <div>
                  <p className="font-medium">Real-time + Persist (30 days)</p>
                  <p className="text-muted-foreground">
                    Delivered instantly via WebSocket. Shows as toast
                    notification. Use for urgent alerts.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                  NORMAL
                </span>
                <div>
                  <p className="font-medium">Persist only (14 days)</p>
                  <p className="text-muted-foreground">
                    Stored in notification center. User sees on next visit.
                    Default for most announcements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  LOW
                </span>
                <div>
                  <p className="font-medium">Persist only (7 days)</p>
                  <p className="text-muted-foreground">
                    Lower visibility. Use for tips or non-essential updates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Types Reference */}
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-4">🔔 Notification Types</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>📢</span>
                <span>System Announcement</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔧</span>
                <span>Maintenance Notice</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📚</span>
                <span>Course Published</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📝</span>
                <span>Lesson Added</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎉</span>
                <span>Course Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span>Achievement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
