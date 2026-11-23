export type UserRole = "admin" | "user";
export type UserGender = "male" | "female";
export type ProviderType = "google" | "facebook" | "system";

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: UserRole;
  gender?: UserGender;
  provider?: ProviderType;
  isDeactivated?: boolean;
  isVerified: boolean;
  isPrivate?: boolean;
  avatarUrl?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: UserGender;
  role: UserRole;
  provider?: ProviderType;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

