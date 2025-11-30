/**
 * Notifications API
 *
 * Admin API client for notification broadcast operations.
 * @see NOTIFICATION-SPECIFICATION.md Section 4.3
 */

import api from "@/lib/api";
import type {
  BroadcastNotificationRequest,
  SendNotificationRequest,
} from "@/types/notification.types";

export const notificationsApi = {
  /**
   * Broadcast notification to all users
   * @param data - Broadcast request payload
   * @returns Success response
   */
  broadcastNotification: async (data: BroadcastNotificationRequest) => {
    const response = await api.post("/admin/notifications/broadcast", data);
    return response.data;
  },

  /**
   * Send notification to specific users
   * @param data - Send request payload with user IDs
   * @returns Success response
   */
  sendNotification: async (data: SendNotificationRequest) => {
    const response = await api.post("/admin/notifications/send", data);
    return response.data;
  },
};
