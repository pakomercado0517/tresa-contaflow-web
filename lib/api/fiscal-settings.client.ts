import { apiClient } from './client';
import type {
  GetFiscalSettingsResponse,
  UpdateFiscalSettingsRequest,
  UpdateFiscalSettingsResponse,
} from '@/lib/types/fiscal-settings';

/**
 * Obtiene configuración fiscal del perfil para un ejercicio (Client Component).
 */
export async function getFiscalSettingsClient(
  profileId: string,
  ejercicio: number
): Promise<GetFiscalSettingsResponse> {
  const query = new URLSearchParams({ ejercicio: ejercicio.toString() }).toString();
  return apiClient<GetFiscalSettingsResponse>(
    `/api/profiles/${profileId}/fiscal-settings?${query}`,
    {
      requireAuth: true,
    }
  );
}

/**
 * Crea o actualiza configuración fiscal del perfil (Client Component).
 */
export async function updateFiscalSettingsClient(
  profileId: string,
  body: UpdateFiscalSettingsRequest
): Promise<UpdateFiscalSettingsResponse> {
  return apiClient<UpdateFiscalSettingsResponse>(
    `/api/profiles/${profileId}/fiscal-settings`,
    {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(body),
    }
  );
}
