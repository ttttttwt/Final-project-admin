/**
 * Email Management Feature - Index
 *
 * Public exports for the email management feature module.
 */

// API
export { emailsApi } from "./api/emailsApi";

// Hooks
export {
  useEmailQueue,
  useEmailStats,
  useEmailDetails,
  useSendEmail,
  useBroadcastEmail,
  useRetryEmail,
  useCancelEmail,
  emailQueryKeys,
} from "./hooks/useEmails";

// Components
export { EmailStatsCards, CompactStats } from "./components/EmailStatsCards";
export { EmailQueueTable } from "./components/EmailQueueTable";
export { EmailDetailDialog } from "./components/EmailDetailDialog";
export { SendEmailDialog } from "./components/SendEmailDialog";
export { EmailPreview, CompactEmailPreview } from "./components/EmailPreview";

// Pages
export { EmailManagementPage } from "./pages/EmailManagementPage";

// Types
export * from "./types/email.types";
