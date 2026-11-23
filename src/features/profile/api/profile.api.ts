import { apiClient } from "../../../services/api.client";
import { IUser } from "../../../types/auth.types";
import { FriendsResponse } from "../../../types/friend.types";
import { uploadService } from "../../../services/upload.service";

export const profileApi = {
  getUserProfile: async (userId: string): Promise<IUser> => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data?.data || response.data;
  },

  getCurrentUser: async (): Promise<IUser> => {
    const response = await apiClient.get("/user/me");
    return response.data?.data || response.data;
  },

  updateProfile: async (data: Partial<IUser>): Promise<IUser> => {
    const response = await apiClient.patch("/user/update-profile", data);
    return response.data?.data || response.data;
  },

  uploadProfilePicture: async (file: File) => {
    return uploadService.uploadProfilePicture(file, "avatar");
  },

  uploadCoverPicture: async (file: File) => {
    return uploadService.uploadProfilePicture(file, "cover");
  },

  searchUsers: async (query: string): Promise<IUser[]> => {
    const response = await apiClient.get(`/user/search?q=${encodeURIComponent(query)}`);
    return response.data?.data || response.data || [];
  },

  sendFriendRequest: async (recipientId: string): Promise<any> => {
    const response = await apiClient.post("/friend/send", { recipientId });
    return response.data?.data || response.data;
  },

  acceptFriendRequest: async (requesterId: string): Promise<any> => {
    const response = await apiClient.post("/friend/accept", { requesterId });
    return response.data?.data || response.data;
  },

  rejectFriendRequest: async (requesterId: string): Promise<any> => {
    const response = await apiClient.post("/friend/reject", { requesterId });
    return response.data?.data || response.data;
  },

  removeFriend: async (friendId: string): Promise<any> => {
    const response = await apiClient.delete(`/friend/unfriend/${friendId}`);
    return response.data?.data || response.data;
  },

  getFriendsList: async (): Promise<FriendsResponse> => {
    const response = await apiClient.get("/friend/list");
    return response.data?.data || response.data || { friends: [], pendingRequests: [], sentPendingRequests: [] };
  },
};
