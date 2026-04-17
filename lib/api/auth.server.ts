import { ServerApiError, serverApiClient } from "./server-client";
import type { GetCurrentUserResponse } from "@/lib/types/auth";

/**
 * Obtiene el usuario actual (Server Component only)
 * Esta función debe ser llamada solo desde Server Components o Server Actions
 * Maneja automáticamente la redirección a login cuando recibe 401
 */
export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  return serverApiClient<GetCurrentUserResponse>("/api/auth/me", {
    redirectOnAuthError: true,
  });
}

/**
 * Igual que getCurrentUser, pero sin redirigir si no hay sesión o el token expiró.
 * Útil en páginas públicas (p. ej. aviso de privacidad) que deben adaptar la UI.
 */
export async function getOptionalCurrentUser(): Promise<GetCurrentUserResponse | null> {
  try {
    return await serverApiClient<GetCurrentUserResponse>("/api/auth/me", {
      redirectOnAuthError: false,
    });
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
