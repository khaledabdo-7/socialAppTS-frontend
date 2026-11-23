import { apiClient } from "../../../services/api.client";
import { IComment, CreateCommentPayload } from "../../../types/comment.types";

export const commentApi = {
  getCommentsByPostId: async (postId: string): Promise<IComment[]> => {
    const response = await apiClient.get(`/comment/get-comments-by-post-id/${postId}`);
    return response.data?.data || response.data || [];
  },

  createComment: async (payload: CreateCommentPayload): Promise<IComment> => {
    const response = await apiClient.post("/comment/create-comment", payload);
    return response.data?.data || response.data;
  },
};

