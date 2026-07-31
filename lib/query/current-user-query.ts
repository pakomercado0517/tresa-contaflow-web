import { useQuery } from '@tanstack/react-query';
import { getCurrentUserClient } from '@/lib/api/auth.client';
import type { GetCurrentUserResponse } from '@/lib/types/auth';
import { currentUserQueryKey } from './query-keys';
import { SUBSCRIPTION_STALE_TIME_MS } from './subscription-query';

export function currentUserQueryOptions() {
  return {
    queryKey: currentUserQueryKey,
    queryFn: (): Promise<GetCurrentUserResponse> => getCurrentUserClient(),
    staleTime: SUBSCRIPTION_STALE_TIME_MS,
  } as const;
}

/**
 * Lee el usuario actual desde la caché de React Query (prefetch del layout).
 * No dispara fetch en cliente: evita duplicar /api/auth/me en el home.
 */
export function useHydratedCurrentUser(): GetCurrentUserResponse | undefined {
  const { data } = useQuery({
    ...currentUserQueryOptions(),
    enabled: false,
  });
  return data;
}

export function getCurrentUserDisplayName(
  currentUser: GetCurrentUserResponse | undefined
): string {
  if (!currentUser) {
    return 'Usuario';
  }
  return currentUser.user.nombre || currentUser.user.email.split('@')[0] || 'Usuario';
}
