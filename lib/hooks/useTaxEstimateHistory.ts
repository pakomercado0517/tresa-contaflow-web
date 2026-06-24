import { useQuery } from '@tanstack/react-query';
import { getTaxEstimateHistoryClient } from '@/lib/api/tax-estimates.client';
import type { TaxEstimateHistoryResponse } from '@/lib/types/tax-estimates';

export interface UseTaxEstimateHistoryParams {
  profileId?: string;
  ejercicio: number;
  regimenFiscal?: string;
}

export function taxEstimateHistoryQueryKey(
  profileId: string,
  ejercicio: number,
  regimenFiscal: string
): readonly [string, string, number, string] {
  return ['tax-estimate-history', profileId, ejercicio, regimenFiscal];
}

export function useTaxEstimateHistory({
  profileId,
  ejercicio,
  regimenFiscal,
}: UseTaxEstimateHistoryParams) {
  const canFetch = Boolean(profileId && regimenFiscal);

  return useQuery<TaxEstimateHistoryResponse, Error>({
    queryKey: canFetch
      ? taxEstimateHistoryQueryKey(profileId as string, ejercicio, regimenFiscal as string)
      : ['tax-estimate-history', 'disabled'],
    queryFn: () =>
      getTaxEstimateHistoryClient({
        profileId: profileId as string,
        ejercicio,
        regimenFiscal: regimenFiscal as string,
      }),
    enabled: canFetch,
  });
}
