import { apiClient } from "./client";
import type { DeleteProfileResponse } from "@/lib/types/profiles";

/**
 * Elimina un perfil del usuario (Client Component only)
 */
export async function deleteProfile(
  profileId: string
): Promise<DeleteProfileResponse> {
  return apiClient<DeleteProfileResponse>(`/api/profiles/${profileId}`, {
    method: "DELETE",
    requireAuth: true,
  });
}
