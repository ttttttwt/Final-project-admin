/**
 * Notification Hooks
 *
 * TanStack Query hooks for notification operations.
 */

import { useMutation } from "@tanstack/react-query";
import { notificationsApi } from "../api/notificationsApi";
import type {
  BroadcastNotificationRequest,
  SendNotificationRequest,
} from "@/types/notification.types";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to broadcast notification to all users
 */
export const useBroadcastNotification = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: BroadcastNotificationRequest) =>
      notificationsApi.broadcastNotification(data),
    onSuccess: () => {
      toast({
        title: "Notification sent",
        description: "Broadcast notification has been sent to all users.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send notification",
        description:
          error.message || "An error occurred while sending the notification.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to send notification to specific users
 */
export const useSendNotification = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SendNotificationRequest) =>
      notificationsApi.sendNotification(data),
    onSuccess: (_, variables) => {
      toast({
        title: "Notification sent",
        description: `Notification has been sent to ${variables.userIds.length} user(s).`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send notification",
        description:
          error.message || "An error occurred while sending the notification.",
        variant: "destructive",
      });
    },
  });
};
