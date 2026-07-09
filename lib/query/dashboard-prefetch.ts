import { QueryClient, dehydrate } from '@tanstack/react-query';
import { getProfiles } from '@/lib/api/profiles';
import { getSubscription } from '@/lib/api/subscription';
import { profilesQueryKey, subscriptionQueryKey } from '@/lib/query/query-keys';
import { SUBSCRIPTION_STALE_TIME_MS } from '@/lib/query/subscription-query';

export async function prefetchDashboardQueries(): Promise<ReturnType<typeof dehydrate>> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: SUBSCRIPTION_STALE_TIME_MS,
      },
    },
  });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: profilesQueryKey,
      queryFn: () => getProfiles(),
    }),
    queryClient.prefetchQuery({
      queryKey: subscriptionQueryKey,
      queryFn: () => getSubscription(),
    }),
  ]);

  return dehydrate(queryClient);
}
