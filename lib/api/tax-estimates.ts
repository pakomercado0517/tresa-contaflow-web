import { serverApiClient } from './server-client';
import {
  buildTaxEstimatesHistoryQuery,
  buildTaxEstimatesListQuery,
  buildTaxEstimatesPeriodQuery,
} from './tax-estimates-query';
import type {
  GetTaxEstimateByPeriodParams,
  GetTaxEstimateHistoryParams,
  GetTaxEstimatesParams,
  TaxEstimateHistoryResponse,
  TaxEstimateListResponse,
} from '@/lib/types/tax-estimates';

/**
 * Calcula estimación fiscal por perfil, mes y año (Server Component / Server Actions).
 * Por defecto el backend persiste snapshots (`persist` omitido = true).
 */
export async function getTaxEstimates(
  params: GetTaxEstimatesParams
): Promise<TaxEstimateListResponse> {
  const query = buildTaxEstimatesListQuery(params);
  return serverApiClient<TaxEstimateListResponse>(`/api/tax-estimates?${query}`, {
    redirectOnAuthError: true,
  });
}

/**
 * Historial de snapshots guardados (no recalcula).
 */
export async function getTaxEstimateHistory(
  params: GetTaxEstimateHistoryParams
): Promise<TaxEstimateHistoryResponse> {
  const query = buildTaxEstimatesHistoryQuery(params);
  return serverApiClient<TaxEstimateHistoryResponse>(`/api/tax-estimates/history?${query}`, {
    redirectOnAuthError: true,
  });
}

/**
 * Estimación a partir del UUID del período contable.
 */
export async function getTaxEstimateByPeriod(
  params: GetTaxEstimateByPeriodParams
): Promise<TaxEstimateListResponse> {
  const { periodId, regimenFiscal, persist } = params;
  const query = buildTaxEstimatesPeriodQuery({ regimenFiscal, persist });
  return serverApiClient<TaxEstimateListResponse>(
    `/api/tax-estimates/period/${periodId}${query}`,
    {
      redirectOnAuthError: true,
    }
  );
}
