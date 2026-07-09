'use client';

import { useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { Profile } from '@/lib/types/profiles';
import { tryRestoreStoredProfileInUrl } from '@/lib/navigation/stored-profile-url';

export function useStoredProfileUrlRestoreRef(pathname: string, profiles: Profile[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastProfilesKeyRef = useRef('');

  return useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || profiles.length === 0) return;

      const profilesKey = profiles.map((profile) => profile.id).join(',');
      if (profilesKey === lastProfilesKeyRef.current) return;
      lastProfilesKeyRef.current = profilesKey;

      tryRestoreStoredProfileInUrl({
        searchParams,
        profiles,
        router,
        pathname,
      });
    },
    [pathname, profiles, router, searchParams]
  );
}
