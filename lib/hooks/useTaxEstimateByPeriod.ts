import { useQuery } from '@tanstack/react-query';
import { getTaxEstimateByPeriodClient } from '@/lib/api/tax-estimates.client';
import type { TaxEstimateListResponse } from '@/lib/types/tax-estimates';

export interface UseTaxEstimateByPeriodParams {
  periodId?: string;
  regimenFiscal?: string;
  persist?: boolean;
}

/**
 * Estimación fiscal por period_id (UUID del periodo contable).
 * Para invalidar tras mutaciones: queryClient.invalidateQueries({ queryKey: ['tax-estimates-by-period', periodId] }).
 */
export function taxEstimateByPeriodQueryKey(
  periodId: string,
  regimenFiscal?: string
): readonly [string, string, string] {
  return ['tax-estimates-by-period', periodId, regimenFiscal ?? 'all'];
}

export function useTaxEstimateByPeriod({
  periodId,
  regimenFiscal,
  persist = true,
}: UseTaxEstimateByPeriodParams) {
  const canFetch = Boolean(periodId);

  return useQuery<TaxEstimateListResponse, Error>({
    queryKey: canFetch
      ? taxEstimateByPeriodQueryKey(periodId as string, regimenFiscal)
      : ['tax-estimates-by-period', 'disabled'],
    queryFn: () =>
      getTaxEstimateByPeriodClient({
        periodId: periodId as string,
        regimenFiscal,
        persist,
      }),
    enabled: canFetch,
  });
}
