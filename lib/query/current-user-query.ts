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
