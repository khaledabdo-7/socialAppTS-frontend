import { apiClient } from "../../../services/api.client";
import { IPost, CreatePostPayload, ReactType } from "../../../types/post.types";

export const postApi = {
  getPosts: async (ownerId?: string): Promise<IPost[]> => {
    const params = ownerId ? { ownerId } : {};
    const response = await apiClient.get("/post/get-posts", { params });
    // Handles { success: true, data: posts } structure
    return response.data?.data || response.data || [];
  },

  getPostById: async (postId: string): Promise<IPost> => {
    const response = await apiClient.get(`/post/${postId}`);
    return response.data?.data || response.data;
  },

  createPost: async (payload: CreatePostPayload | FormData): Promise<IPost> => {
    const response = await apiClient.post("/post/create-post", payload);
    return response.data?.data || response.data;
  },

  uploadPostImage: async (postId: string, file: File): Promise<IPost> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post(`/post/${postId}/image`, formData);
    return response.data?.data || response.data;
  },

  reactToPost: async (postId: string, type: ReactType): Promise<any> => {
    const response = await apiClient.post(`/post/${postId}/react`, { type });
    return response.data?.data || response.data;
  },
};
