'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDashboardHomeReplaceSearch } from '@/lib/navigation/resolve-dashboard-list-filters';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import type { GetProfilesResponse } from '@/lib/types/profiles';

export function DashboardHomeUrlSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastReplaceSearchRef = useRef<string | null>(null);

  const { data: profilesData } = useQuery<GetProfilesResponse, Error>(profilesQueryOptions());

  const filtersReady = profilesData !== undefined;
  const profiles = useMemo(() => profilesData?.data ?? [], [profilesData]);

  const replaceSearch = useMemo(() => {
    if (!filtersReady) return null;
    return getDashboardHomeReplaceSearch(searchParams, profiles);
  }, [filtersReady, searchParams, profiles]);

  useEffect(() => {
    if (!replaceSearch) {
      lastReplaceSearchRef.current = null;
      return;
    }
    if (lastReplaceSearchRef.current === replaceSearch) return;
    lastReplaceSearchRef.current = replaceSearch;
    router.replace(`/dashboard?${replaceSearch}`, { scroll: false });
  }, [replaceSearch, router]);

  return null;
}
