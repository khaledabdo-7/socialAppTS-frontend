import { apiClient } from "../../../services/api.client";

export interface IChatMessage {
  _id: string;
  senderId: string | { _id: string; name: string; avatar?: string; avatarUrl?: string };
  receiverId: string | { _id: string; name: string };
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getChatHistory: async (friendId: string, page = 1, limit = 50): Promise<{ messages: IChatMessage[]; total: number; page: number }> => {
    const res = await apiClient.get(`/chat/history/${friendId}?page=${page}&limit=${limit}`);
    return res.data?.data || res.data;
  },

  getRecentConversations: async (): Promise<any[]> => {
    const res = await apiClient.get("/chat/conversations");
    return res.data?.data || res.data || [];
  },

  markChatAsRead: async (friendId: string): Promise<void> => {
    await apiClient.patch(`/chat/read/${friendId}`);
  },
};
