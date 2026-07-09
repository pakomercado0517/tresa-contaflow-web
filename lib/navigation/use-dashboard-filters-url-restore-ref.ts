'use client';

import { useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { Profile } from '@/lib/types/profiles';
import { tryRestoreDashboardFiltersInUrl } from '@/lib/navigation/dashboard-filters-url';

export function useDashboardFiltersUrlRestoreRef(pathname: string, profiles: Profile[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastProfilesKeyRef = useRef('');

  return useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const profilesKey = profiles.map((profile) => profile.id).join(',');
      if (profilesKey === lastProfilesKeyRef.current) return;
      lastProfilesKeyRef.current = profilesKey;

      tryRestoreDashboardFiltersInUrl({
        searchParams,
        profiles,
        router,
        pathname,
      });
    },
    [pathname, profiles, router, searchParams]
  );
}
