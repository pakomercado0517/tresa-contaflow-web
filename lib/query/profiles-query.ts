import { getProfilesClient } from '@/lib/api/profiles.client';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import { profilesQueryKey } from './query-keys';
import { SUBSCRIPTION_STALE_TIME_MS } from './subscription-query';

export function profilesQueryOptions() {
  return {
    queryKey: profilesQueryKey,
    queryFn: (): Promise<GetProfilesResponse> => getProfilesClient(),
    staleTime: SUBSCRIPTION_STALE_TIME_MS,
  } as const;
}
