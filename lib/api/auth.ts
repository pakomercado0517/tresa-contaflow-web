import { apiClient } from "./client";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResendVerificationEmailRequest,
  ResendVerificationEmailResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ErrorResponse,
} from "@/lib/types/auth";

export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshAccessToken(
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  return apiClient<RefreshTokenResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutUser(): Promise<LogoutResponse> {
  return apiClient<LogoutResponse>("/api/auth/logout", {
    method: "POST",
    requireAuth: true,
  });
}

export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
  return apiClient<VerifyEmailResponse>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  return apiClient<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  return apiClient<ResetPasswordResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resendVerificationEmail(
  data: ResendVerificationEmailRequest
): Promise<ResendVerificationEmailResponse> {
  return apiClient<ResendVerificationEmailResponse>(
    "/api/auth/resend-verification-email",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  return apiClient<UpdateProfileResponse>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
    requireAuth: true,
  });
}


