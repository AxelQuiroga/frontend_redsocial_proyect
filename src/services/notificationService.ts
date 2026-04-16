import { httpClient } from "../infrastructure/http/httpClient";
import type {
  NotificationsPaginatedResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse
} from "../types/notification";

export const notificationService = {
  getNotifications: async (page = 1, limit = 10): Promise<NotificationsPaginatedResponse> => {
    const res = await httpClient.get("/notifications", { params: { page, limit } });
    return res.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const res = await httpClient.get("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (notificationId: string): Promise<MarkAsReadResponse> => {
    const res = await httpClient.put(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const res = await httpClient.put("/notifications/read-all");
    return res.data;
  }
};
