import { serverApiClient } from "./server-client";
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
