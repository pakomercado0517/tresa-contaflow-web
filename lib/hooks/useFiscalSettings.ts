import { useQuery } from '@tanstack/react-query';
import { getFiscalSettingsClient } from '@/lib/api/fiscal-settings.client';
import type { GetFiscalSettingsResponse } from '@/lib/types/fiscal-settings';

export function fiscalSettingsQueryKey(
  profileId: string,
  ejercicio: number
): readonly [string, string, number] {
  return ['fiscal-settings', profileId, ejercicio];
}

export function fiscalSettingsProfilePrefixKey(
  profileId: string
): readonly [string, string] {
  return ['fiscal-settings', profileId];
}

export function useFiscalSettings(profileId: string, ejercicio: number) {
  return useQuery<GetFiscalSettingsResponse, Error>({
    queryKey: fiscalSettingsQueryKey(profileId, ejercicio),
    queryFn: () => getFiscalSettingsClient(profileId, ejercicio),
    enabled: Boolean(profileId),
  });
}
