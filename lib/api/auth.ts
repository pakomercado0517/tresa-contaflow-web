import { apiClient } from "./client";
import type {
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationEmailRequest,
  ResendVerificationEmailResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  CompleteTourRequest,
  CompleteTourResponse,
} from "@/lib/types/auth";

export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/api/auth/register", {
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

export async function completeTour(
  data: CompleteTourRequest
): Promise<CompleteTourResponse> {
  return apiClient<CompleteTourResponse>("/api/auth/tour-complete", {
    method: "PATCH",
    body: JSON.stringify(data),
    requireAuth: true,
  });
}
