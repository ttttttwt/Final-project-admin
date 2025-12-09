/**
 * Email Management Page
 * Admin page for managing email queue, sending emails, and viewing statistics
 */

import { useState } from "react";
import { Mail, Send, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EmailStatsCards } from "../components/EmailStatsCards";
import { EmailQueueTable } from "../components/EmailQueueTable";
import { EmailDetailDialog } from "../components/EmailDetailDialog";
import { SendEmailDialog } from "../components/SendEmailDialog";
import {
  useEmailQueue,
  useEmailStats,
  useSendEmail,
  useBroadcastEmail,
  useRetryEmail,
  useCancelEmail,
} from "../hooks/useEmails";
import type {
  EmailQueueDTO,
  EmailQueueSearchParams,
  EmailStatus,
  StatsPeriod,
} from "../types/email.types";
import { EMAIL_STATUS_LABELS, STATS_PERIOD_LABELS } from "../types/email.types";

export function EmailManagementPage() {
  const { toast } = useToast();

  // State
  const [params, setParams] = useState<EmailQueueSearchParams>({
    page: 0,
    size: 20,
    sort: "createdAt,desc",
  });
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>("LAST_7_DAYS");
  const [selectedEmail, setSelectedEmail] = useState<EmailQueueDTO | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Queries
  const {
    data: queueData,
    isLoading: isQueueLoading,
    refetch: refetchQueue,
  } = useEmailQueue(params);

  const { data: statsData, isLoading: isStatsLoading } = useEmailStats(statsPeriod);

  // Mutations
  const sendEmail = useSendEmail();
  const broadcastEmail = useBroadcastEmail();
  const retryEmail = useRetryEmail();
  const cancelEmail = useCancelEmail();

  // Handlers
  const handleStatusFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      status: value === "all" ? undefined : (value as EmailStatus),
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleRetry = (emailId: string) => {
    retryEmail.mutate(emailId, {
      onSuccess: () => {
        toast({
          title: "Retry Scheduled",
          description: "The email will be retried shortly.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to schedule retry.",
          variant: "destructive",
        });
      },
    });
  };

  const handleCancel = (emailId: string) => {
    cancelEmail.mutate(emailId, {
      onSuccess: () => {
        toast({
          title: "Email Cancelled",
          description: "The email has been cancelled.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to cancel email.",
          variant: "destructive",
        });
      },
    });
  };

  const handleSendEmail = (request: Parameters<typeof sendEmail.mutate>[0]) => {
    sendEmail.mutate(request, {
      onSuccess: (data) => {
        toast({
          title: "Email Queued",
          description: data.message,
        });
        setShowSendDialog(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to queue email.",
          variant: "destructive",
        });
      },
    });
  };

  const handleBroadcastEmail = (request: Parameters<typeof broadcastEmail.mutate>[0]) => {
    broadcastEmail.mutate(request, {
      onSuccess: (data) => {
        toast({
          title: "Broadcast Queued",
          description: data.message,
        });
        setShowSendDialog(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to queue broadcast.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Management
          </h1>
          <p className="text-muted-foreground">
            Monitor email queue, view statistics, and send emails to users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchQueue()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowSendDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Statistics</h2>
          <Select
            value={statsPeriod}
            onValueChange={(v) => setStatsPeriod(v as StatsPeriod)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATS_PERIOD_LABELS) as StatsPeriod[]).map((period) => (
                <SelectItem key={period} value={period}>
                  {STATS_PERIOD_LABELS[period]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <EmailStatsCards stats={statsData} isLoading={isStatsLoading} />
      </div>

      {/* Email Queue Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Email Queue
              {queueData && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({queueData.totalElements} total)
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={params.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {(Object.keys(EMAIL_STATUS_LABELS) as EmailStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {EMAIL_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EmailQueueTable
            data={queueData}
            isLoading={isQueueLoading}
            onRetry={handleRetry}
            onCancel={handleCancel}
            onViewDetails={setSelectedEmail}
            onPageChange={handlePageChange}
            isRetrying={retryEmail.isPending}
            isCancelling={cancelEmail.isPending}
          />
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        email={selectedEmail}
        open={!!selectedEmail}
        onOpenChange={(open) => !open && setSelectedEmail(null)}
      />

      {/* Send Email Dialog */}
      <SendEmailDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        onSendEmail={handleSendEmail}
        onBroadcastEmail={handleBroadcastEmail}
        isSending={sendEmail.isPending}
        isBroadcasting={broadcastEmail.isPending}
      />
    </div>
  );
}
