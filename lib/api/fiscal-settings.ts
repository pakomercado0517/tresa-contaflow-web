import { serverApiClient } from './server-client';
import type {
  GetFiscalSettingsResponse,
  UpdateFiscalSettingsRequest,
  UpdateFiscalSettingsResponse,
} from '@/lib/types/fiscal-settings';

/**
 * Obtiene configuración fiscal del perfil para un ejercicio (Server Component).
 */
export async function getFiscalSettings(
  profileId: string,
  ejercicio: number
): Promise<GetFiscalSettingsResponse> {
  const query = new URLSearchParams({ ejercicio: ejercicio.toString() }).toString();
  return serverApiClient<GetFiscalSettingsResponse>(
    `/api/profiles/${profileId}/fiscal-settings?${query}`,
    {
      redirectOnAuthError: true,
    }
  );
}

/**
 * Crea o actualiza configuración fiscal del perfil (Server Component / Server Actions).
 */
export async function updateFiscalSettings(
  profileId: string,
  body: UpdateFiscalSettingsRequest
): Promise<UpdateFiscalSettingsResponse> {
  return serverApiClient<UpdateFiscalSettingsResponse>(
    `/api/profiles/${profileId}/fiscal-settings`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
      redirectOnAuthError: true,
    }
  );
}
