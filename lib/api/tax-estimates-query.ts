import type {
  GetTaxEstimateHistoryParams,
  GetTaxEstimatesParams,
} from '@/lib/types/tax-estimates';

export function buildTaxEstimatesListQuery(params: GetTaxEstimatesParams): string {
  const queryParams = new URLSearchParams();
  queryParams.append('profile_id', params.profileId);
  queryParams.append('mes', params.mes.toString());
  queryParams.append('año', params.año.toString());
  if (params.regimenFiscal) {
    queryParams.append('regimen_fiscal', params.regimenFiscal);
  }
  if (params.persist !== undefined) {
    queryParams.append('persist', String(params.persist));
  }
  return queryParams.toString();
}

export function buildTaxEstimatesHistoryQuery(params: GetTaxEstimateHistoryParams): string {
  const queryParams = new URLSearchParams();
  queryParams.append('profile_id', params.profileId);
  queryParams.append('ejercicio', params.ejercicio.toString());
  if (params.regimenFiscal) {
    queryParams.append('regimen_fiscal', params.regimenFiscal);
  }
  return queryParams.toString();
}
