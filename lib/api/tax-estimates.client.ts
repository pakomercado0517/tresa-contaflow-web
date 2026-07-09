import { apiClient } from './client';
import {
  buildTaxEstimatesHistoryQuery,
  buildTaxEstimatesListQuery,
} from './tax-estimates-query';
import type {
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
