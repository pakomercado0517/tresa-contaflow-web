import { serverApiClient } from "./server-client";
import type {
  GetProfilesResponse,
  GetProfileResponse,
  CreateProfileRequest,
  CreateProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
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

/**
 * Obtiene un perfil por ID (Server Component only)
 * Esta función debe ser llamada solo desde Server Components o Server Actions
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getProfile(profileId: string): Promise<GetProfileResponse> {
  return serverApiClient<GetProfileResponse>(`/api/profiles/${profileId}`, {
    redirectOnAuthError: true,
  });
}

/**
 * Actualiza un perfil existente (Server Component only)
 * Esta función debe ser llamada solo desde Server Components o Server Actions
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function updateProfile(
  profileId: string,
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  return serverApiClient<UpdateProfileResponse>(`/api/profiles/${profileId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    redirectOnAuthError: true,
  });
}

