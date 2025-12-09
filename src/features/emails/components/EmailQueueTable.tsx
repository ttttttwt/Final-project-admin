/**
 * Email Queue Table Component
 * Displays email queue with actions
 */

import { useState } from "react";
import { format } from "date-fns";
import {
  RefreshCw,
  X,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { Page } from "@/types/api.types";
import type { EmailQueueDTO, EmailStatus } from "../types/email.types";
import { EMAIL_STATUS_LABELS, EMAIL_TYPE_LABELS } from "../types/email.types";

interface EmailQueueTableProps {
  data: Page<EmailQueueDTO> | undefined;
  isLoading: boolean;
  onRetry: (emailId: string) => void;
  onCancel: (emailId: string) => void;
  onViewDetails: (email: EmailQueueDTO) => void;
  onPageChange: (page: number) => void;
  isRetrying: boolean;
  isCancelling: boolean;
}

// Status badge colors
const statusColors: Record<EmailStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  SENT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  BOUNCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function EmailQueueTable({
  data,
  isLoading,
  onRetry,
  onCancel,
  onViewDetails,
  onPageChange,
  isRetrying,
  isCancelling,
}: EmailQueueTableProps) {
  const [confirmAction, setConfirmAction] = useState<{
    type: "retry" | "cancel";
    emailId: string;
    subject: string;
  } | null>(null);

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "retry") {
      onRetry(confirmAction.emailId);
    } else {
      onCancel(confirmAction.emailId);
    }
    setConfirmAction(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    );
  }

  const emails = data?.content ?? [];
  const currentPage = data?.number ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  if (emails.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No emails in queue
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {email.recipientName || "—"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {email.recipientEmail}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {EMAIL_TYPE_LABELS[email.emailType] || email.emailType}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="max-w-[200px] truncate block" title={email.subject}>
                    {email.subject}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[email.status]}>
                    {EMAIL_STATUS_LABELS[email.status]}
                  </Badge>
                  {email.attempts > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({email.attempts}/{email.maxAttempts})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(email.createdAt), "MMM d, HH:mm")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(email)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {(email.status === "FAILED" ||
                        email.status === "BOUNCED") && (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({
                              type: "retry",
                              emailId: email.id,
                              subject: email.subject,
                            })
                          }
                          disabled={isRetrying}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </DropdownMenuItem>
                      )}
                      {email.status === "PENDING" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({
                              type: "cancel",
                              emailId: email.id,
                              subject: email.subject,
                            })
                          }
                          disabled={isCancelling}
                          className="text-destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          Showing {emails.length} of {totalElements} emails
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "retry" ? "Retry Email?" : "Cancel Email?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "retry"
                ? `Are you sure you want to retry sending "${confirmAction?.subject}"?`
                : `Are you sure you want to cancel "${confirmAction?.subject}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmAction?.type === "cancel" ? "bg-destructive" : ""
              }
            >
              {confirmAction?.type === "retry" ? "Retry" : "Cancel Email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
