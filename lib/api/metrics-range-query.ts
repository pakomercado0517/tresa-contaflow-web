import type { GetMetricsRangeParams, MetricsRangeBounds } from '@/lib/types/metrics';

export function appendMetricsRangeQueryParams(
  queryParams: URLSearchParams,
  params: GetMetricsRangeParams
): void {
  queryParams.append('mes_desde', params.mesDesde.toString());
  queryParams.append('año_desde', params.añoDesde.toString());
  queryParams.append('mes_hasta', params.mesHasta.toString());
  queryParams.append('año_hasta', params.añoHasta.toString());
  if (params.profileId) {
    queryParams.append('profile_id', params.profileId);
  }
  if (params.regimenFiscal) {
    queryParams.append('regimen_fiscal', params.regimenFiscal);
  }
}

export function trendBoundsToMetricsRangeBounds(bounds: {
  mesDesde: number;
  añoDesde: number;
  mesHasta: number;
  añoHasta: number;
}): MetricsRangeBounds {
  return {
    mes_desde: bounds.mesDesde,
    año_desde: bounds.añoDesde,
    mes_hasta: bounds.mesHasta,
    año_hasta: bounds.añoHasta,
  };
}
