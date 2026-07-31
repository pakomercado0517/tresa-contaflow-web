'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import type { Profile } from '@/lib/types/profiles';

interface UseSelectedDashboardProfileResult {
  profiles: Profile[];
  activeProfile: Profile | null;
  companyName: string | undefined;
}

export function useSelectedDashboardProfile(
  selectedProfileId?: string
): UseSelectedDashboardProfileResult {
  const { data: profilesData } = useQuery(profilesQueryOptions());
  const profiles = useMemo(() => profilesData?.data ?? [], [profilesData]);

  return useMemo(() => {
    const activeProfile = selectedProfileId
      ? (profiles.find((profile) => profile.id === selectedProfileId) ?? null)
      : null;
    const companyName = selectedProfileId
      ? activeProfile?.nombre
      : profiles.length > 0
        ? 'Selecciona un RFC'
        : undefined;

    return { profiles, activeProfile, companyName };
  }, [profiles, selectedProfileId]);
}
