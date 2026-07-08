import { apiClient } from './client';
import type { DeleteProfileResponse, GetProfilesResponse, Profile } from '@/lib/types/profiles';

/**
 * Obtiene los perfiles del usuario (Client Component only)
 */
export async function getProfilesClient(): Promise<GetProfilesResponse> {
  return apiClient<GetProfilesResponse>('/api/profiles', {
    requireAuth: true,
  });
}

/**
 * Elimina un perfil del usuario (Client Component only)
 */
export async function deleteProfile(profileId: string): Promise<DeleteProfileResponse> {
  return apiClient<DeleteProfileResponse>(`/api/profiles/${profileId}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}

/**
 * Congela perfiles que exceden el límite del plan
 */
export interface FreezeOthersResponse {
  message: string;
  frozen: Profile[];
  active: Profile;
  count: {
    frozen: number;
    total: number;
  };
}

export async function freezeExcessProfiles(
  preserveProfileId: string
): Promise<FreezeOthersResponse> {
  return apiClient<FreezeOthersResponse>('/api/profiles/freeze-others', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({
      preserveProfileId,
    }),
  });
}
