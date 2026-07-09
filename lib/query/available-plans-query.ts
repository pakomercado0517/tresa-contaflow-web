import { getAvailablePlansClient } from '@/lib/api/subscription.client';
import type { GetAvailablePlansResponse } from '@/lib/types/subscription';
import { availablePlansQueryKey } from './query-keys';
import { SUBSCRIPTION_STALE_TIME_MS } from './subscription-query';

export function availablePlansQueryOptions(billing: 'monthly' | 'annual') {
  return {
    queryKey: availablePlansQueryKey(billing),
    queryFn: (): Promise<GetAvailablePlansResponse> => getAvailablePlansClient(billing),
    staleTime: SUBSCRIPTION_STALE_TIME_MS,
  } as const;
}
