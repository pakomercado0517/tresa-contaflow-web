import { serverApiClient } from "./server-client";
import type {
  GetProfilesResponse,
  CreateProfileRequest,
  CreateProfileResponse,
} from "@/lib/types/profiles";

/**
 * Obtiene los perfiles del usuario (Server Component only)
 * Esta función debe ser llamada solo desde Server Components o Server Actions
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getProfiles(): Promise<GetProfilesResponse> {
  return serverApiClient<GetProfilesResponse>("/api/profiles", {
    redirectOnAuthError: true, // Redirigir a login si falla la autenticación
  });
}

/**
 * Crea un nuevo perfil (Server Component only)
 * Esta función debe ser llamada solo desde Server Components o Server Actions
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function createProfile(
  data: CreateProfileRequest
): Promise<CreateProfileResponse> {
  return serverApiClient<CreateProfileResponse>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(data),
    redirectOnAuthError: true,
  });
}

