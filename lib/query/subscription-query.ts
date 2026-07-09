import { getSubscriptionClient } from '@/lib/api/subscription.client';
import type { GetSubscriptionResponse } from '@/lib/types/subscription';
import { subscriptionQueryKey } from './query-keys';

export const SUBSCRIPTION_STALE_TIME_MS = 5 * 60 * 1000;

export function subscriptionQueryOptions() {
  return {
    queryKey: subscriptionQueryKey,
    queryFn: (): Promise<GetSubscriptionResponse> => getSubscriptionClient(),
    staleTime: SUBSCRIPTION_STALE_TIME_MS,
  } as const;
}
