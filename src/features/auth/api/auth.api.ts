import { apiClient } from "../../../services/api.client";
import {
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  IAuthResponse,
  IUser,
} from "../../../types/auth.types";
import { useAuthStore } from "../../../store/auth.store";

export const authApi = {
  login: async (payload: LoginPayload): Promise<IAuthResponse> => {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<IUser> => {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<boolean> => {
    const response = await apiClient.post("/auth/verifyOtp", payload);
    return response.data;
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/resendOtp", { email });
    return response.data;
  },

  logout: async (): Promise<void> => {
    const { accessToken, refreshToken } = useAuthStore.getState();
    try {
      if (accessToken && refreshToken) {
        await apiClient.post("/auth/logout", { accessToken, refreshToken });
      }
    } finally {
      useAuthStore.getState().logout();
    }
  },

  forgetPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/forgetPassword", { email });
    return response.data;
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/resetPassword", payload);
    return response.data;
  },
};

