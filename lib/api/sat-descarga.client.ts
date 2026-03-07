import { apiClient } from './client';
import type {
  SATDownloadStatus,
  RegisterFIELRequest,
  RegisterFIELResponse,
  TriggerSyncResponse,
} from '@/lib/types/sat-descarga';

export async function getSATDownloadStatus(
  profileId: string
): Promise<SATDownloadStatus> {
  return apiClient<SATDownloadStatus>(
    `/api/sat-descarga/status/${profileId}`,
    { requireAuth: true }
  );
}

export async function registerFIEL(
  data: RegisterFIELRequest
): Promise<RegisterFIELResponse> {
  return apiClient<RegisterFIELResponse>('/api/sat-descarga/register', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
}

export async function triggerSATSync(
  profileId: string
): Promise<TriggerSyncResponse> {
  return apiClient<TriggerSyncResponse>(
    `/api/sat-descarga/trigger/${profileId}`,
    { method: 'POST', requireAuth: true }
  );
}
