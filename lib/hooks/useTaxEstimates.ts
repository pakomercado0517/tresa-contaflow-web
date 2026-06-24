import { useQuery, type QueryClient } from '@tanstack/react-query';
import { getTaxEstimatesClient } from '@/lib/api/tax-estimates.client';
import type { TaxEstimateListResponse } from '@/lib/types/tax-estimates';

export interface UseTaxEstimatesParams {
  profileId?: string;
  mes: number;
  año: number;
  regimenFiscal?: string;
  persist?: boolean;
}

export function taxEstimatesQueryKey(
  profileId: string,
  mes: number,
  año: number,
  regimenFiscal?: string
): readonly [string, string, number, number, string] {
  return ['tax-estimates', profileId, mes, año, regimenFiscal ?? 'all'];
}

export function useTaxEstimates({
  profileId,
  mes,
  año,
  regimenFiscal,
  persist = true,
}: UseTaxEstimatesParams) {
  const hasProfile = Boolean(profileId);

  return useQuery<TaxEstimateListResponse, Error>({
    queryKey: hasProfile
      ? taxEstimatesQueryKey(profileId as string, mes, año, regimenFiscal)
      : ['tax-estimates', 'disabled'],
    queryFn: () =>
      getTaxEstimatesClient({
        profileId: profileId as string,
        mes,
        año,
        regimenFiscal,
        persist,
      }),
    enabled: hasProfile,
  });
}

export async function invalidateTaxEstimatesForProfile(
  queryClient: QueryClient,
  profileId: string
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['tax-estimates', profileId] });
  await queryClient.invalidateQueries({ queryKey: ['tax-estimate-history', profileId] });
}
