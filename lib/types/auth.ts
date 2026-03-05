// Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Response Types
export interface User {
  id: string;
  email: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  email_verified: boolean;
  tour_version: string | null;
  tour_completed_at: string | null;
  logo_url?: string | null;
  nombre_comercial?: string | null;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export interface ResendVerificationEmailResponse {
  message: string;
}

export interface UpdateProfileRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  logo_url?: string;
  nombre_comercial?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface GetCurrentUserResponse {
  user: User;
}

export interface CompleteTourRequest {
  tour_version: string;
}

export interface CompleteTourResponse {
  message: string;
  data: {
    tour_version: string;
    tour_completed_at: string;
  };
}

export interface ErrorResponse {
  error: string;
  message?: string;
}


