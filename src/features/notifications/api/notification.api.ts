import { apiClient } from "../../../services/api.client";

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
    avatarUrl?: string;
    gender?: string;
  };
  type: "FRIEND_REQUEST" | "FRIEND_ACCEPT" | "POST_COMMENT" | "POST_REACTION" | "SYSTEM";
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (page = 1, limit = 20): Promise<{ notifications: NotificationItem[]; total: number; unreadCount: number }> => {
    const res = await apiClient.get(`/notification?page=${page}&limit=${limit}`);
    return res.data?.data || res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get("/notification/unread-count");
    return res.data?.data?.unreadCount ?? 0;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notification/read-all");
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notification/${id}/read`);
  },
};
