import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "../types/auth.types";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { user: IUser; accessToken: string; refreshToken: string }) => void;
  setAccessToken: (token: string) => void;
  updateUser: (user: Partial<IUser>) => void;
  logout: () => void;
}

const normalizeUser = (user: IUser | null): IUser | null => {
  if (!user) return null;
  const avatar = user.avatar || user.avatarUrl || "";
  return {
    ...user,
    avatar,
    avatarUrl: avatar,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({
          user: normalizeUser(user),
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken) =>
        set({
          accessToken,
        }),

      updateUser: (updatedFields) =>
        set((state) => {
          if (!state.user) return { user: null };
          const merged = { ...state.user, ...updatedFields };
          return {
            user: normalizeUser(merged),
          };
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "social-app-auth",
    },
  ),
);

