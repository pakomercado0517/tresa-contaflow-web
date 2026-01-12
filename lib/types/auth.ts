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
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}


