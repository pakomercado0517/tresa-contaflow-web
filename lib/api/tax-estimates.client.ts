import { apiClient } from './client';
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
 * Calcula estimación fiscal por perfil, mes y año (Client Component).
 */
export async function getTaxEstimatesClient(
  params: GetTaxEstimatesParams
): Promise<TaxEstimateListResponse> {
  const query = buildTaxEstimatesListQuery(params);
  return apiClient<TaxEstimateListResponse>(`/api/tax-estimates?${query}`, {
    requireAuth: true,
  });
}

/**
 * Historial de snapshots guardados (Client Component).
 */
export async function getTaxEstimateHistoryClient(
  params: GetTaxEstimateHistoryParams
): Promise<TaxEstimateHistoryResponse> {
  const query = buildTaxEstimatesHistoryQuery(params);
  return apiClient<TaxEstimateHistoryResponse>(`/api/tax-estimates/history?${query}`, {
    requireAuth: true,
  });
}

/**
 * Estimación por period_id (Client Component).
 */
export async function getTaxEstimateByPeriodClient(
  params: GetTaxEstimateByPeriodParams
): Promise<TaxEstimateListResponse> {
  const { periodId, regimenFiscal, persist } = params;
  const query = buildTaxEstimatesPeriodQuery({ regimenFiscal, persist });
  return apiClient<TaxEstimateListResponse>(
    `/api/tax-estimates/period/${periodId}${query}`,
    {
      requireAuth: true,
    }
  );
}
