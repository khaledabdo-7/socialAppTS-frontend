import { apiClient } from "./api.client";
import { IUser } from "../types/auth.types";
import { IPost } from "../types/post.types";

export interface ProfileUploadResponse {
  url: string;
  secure_url?: string;
  user: IUser;
  type: "avatar" | "cover";
}

export interface PostUploadResponse {
  url: string;
  secure_url?: string;
  post?: IPost;
}

export const uploadService = {
  /**
   * Upload Profile/Avatar or Cover Picture:
   * Uploads the image and links it directly to the user profile in MongoDB in ONE server-sided call.
   */
  uploadProfilePicture: async (
    file: File,
    type: "avatar" | "cover" = "avatar",
  ): Promise<ProfileUploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    const response = await apiClient.post("/upload/profile-picture", formData);
    const data = response.data?.data || response.data;

    const url = data.secure_url || data.url;
    if (!url) {
      throw new Error("No URL returned from profile picture upload");
    }

    return {
      url,
      secure_url: data.secure_url || url,
      user: data.user,
      type,
    };
  },

  /**
   * Upload Post Picture:
   * Uploads post picture with post-specific logic and links directly to a post on the server-side in ONE call.
   */
  uploadPostPicture: async (
    file: File,
    postId?: string,
  ): Promise<PostUploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    if (postId) {
      formData.append("postId", postId);
    }

    const response = await apiClient.post("/upload/post-picture", formData);
    const data = response.data?.data || response.data;

    const url = data.secure_url || data.url;
    if (!url) {
      throw new Error("No URL returned from post picture upload");
    }

    return {
      url,
      secure_url: data.secure_url || url,
      post: data.post,
    };
  },

  /**
   * Legacy general image upload
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post("/upload/image", formData);
    const data = response.data?.data || response.data;
    const url = data.secure_url || data.url;

    if (!url) {
      throw new Error("No URL returned from upload service");
    }

    return url;
  },
};
