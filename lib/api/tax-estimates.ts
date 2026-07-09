import { serverApiClient } from './server-client';
import { buildTaxEstimatesListQuery } from './tax-estimates-query';
import type {
  GetTaxEstimatesParams,
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
