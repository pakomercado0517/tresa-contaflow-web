import { apiClient } from './client';
import type { GetCurrentUserResponse } from '@/lib/types/auth';

export async function getCurrentUserClient(): Promise<GetCurrentUserResponse> {
  return apiClient<GetCurrentUserResponse>('/api/auth/me', {
    requireAuth: true,
  });
}
