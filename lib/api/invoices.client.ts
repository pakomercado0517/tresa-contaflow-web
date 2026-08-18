import { apiClient } from './client';
import { fetchAllPages } from './fetch-all-pages';
import type {
  UploadInvoiceResponse,
  DeleteInvoiceResponse,
  GetInvoicesResponse,
  Invoice,
} from '@/lib/types/invoices';
import {
  createEmptyMetricsRangeResponse,
  DEFAULT_PERIOD_METRICS,
  type GetMetricsRangeParams,
  type MetricsRangeResponse,
  type PeriodMetricsResponse,
} from '@/lib/types/metrics';
import type { TrendDataPoint, TrendPeriodView } from './invoices';
import { appendMetricsRangeQueryParams, trendBoundsToMetricsRangeBounds } from './metrics-range-query';
import {
  buildTrendSeriesForView,
  getTrendRangeBounds,
} from '@/lib/utils/metrics-trend-range';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

export type { TrendDataPoint };

export interface GetInvoicesClientParams {
  profileId?: string;
  mes?: number;
  año?: number;
  regimen_fiscal?: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Obtiene las facturas del usuario (Client Component only)
 */
export async function getInvoicesClient(
  params?: GetInvoicesClientParams
): Promise<GetInvoicesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.profileId) queryParams.append('profileId', params.profileId);
  if (params?.mes) queryParams.append('mes', params.mes.toString());
  if (params?.año) queryParams.append('año', params.año.toString());
  if (params?.regimen_fiscal) queryParams.append('regimen_fiscal', params.regimen_fiscal);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/invoices${queryString ? `?${queryString}` : ''}`;

  return apiClient<GetInvoicesResponse>(endpoint, {
    requireAuth: true,
  });
}

export async function getAllInvoicesClient(
  params?: Omit<GetInvoicesClientParams, 'page' | 'limit'>
): Promise<Invoice[]> {
  return fetchAllPages((page, limit) => getInvoicesClient({ ...params, page, limit }));
}

/**
 * Obtiene las métricas del usuario (Client Component only).
 * Si el backend devuelve 404 (usuario sin suscripción o sin período), devuelve métricas en cero.
 */
export async function getMetricsClient(
  profileId?: string,
  mes?: number,
  año?: number,
  regimenFiscal?: string
): Promise<PeriodMetricsResponse> {
  const queryParams = new URLSearchParams();

  if (profileId) queryParams.append('profile_id', profileId);
  if (mes) queryParams.append('mes', mes.toString());
  if (año) queryParams.append('año', año.toString());
  if (regimenFiscal) queryParams.append('regimen_fiscal', regimenFiscal);

  const queryString = queryParams.toString();
  const endpoint = `/api/metrics${queryString ? `?${queryString}` : ''}`;

  return apiClient<PeriodMetricsResponse>(endpoint, {
    requireAuth: true,
    notFoundDefault: DEFAULT_PERIOD_METRICS,
  });
}

export async function getMetricsRangeClient(
  params: GetMetricsRangeParams
): Promise<MetricsRangeResponse> {
  const queryParams = new URLSearchParams();
  appendMetricsRangeQueryParams(queryParams, params);

  const queryString = queryParams.toString();
  const endpoint = `/api/metrics?${queryString}`;

  const emptyDefault = createEmptyMetricsRangeResponse(
    trendBoundsToMetricsRangeBounds(params)
  );

  return apiClient<MetricsRangeResponse>(endpoint, {
    requireAuth: true,
    notFoundDefault: emptyDefault,
  });
}

/**
 * Obtiene datos de tendencia mensual (Client Component only)
 */
export async function getTrendDataClient(
  profileId?: string,
  año?: number,
  periodView: TrendPeriodView = 'año-actual',
  mesCorte?: number,
  regimenFiscal?: string
): Promise<TrendDataPoint[]> {
  const { año: currentYear } = getCurrentMonthYearInAppTimezone();
  const year = año ?? currentYear;

  const bounds = getTrendRangeBounds(periodView, year, mesCorte);
  const range = await getMetricsRangeClient({
    ...bounds,
    profileId,
    regimenFiscal,
  });

  return buildTrendSeriesForView(range.items, periodView, year, mesCorte);
}

/**
 * Sube un archivo XML de factura al backend (Client Component only)
 */
export async function uploadInvoice(file: File, profileId: string): Promise<UploadInvoiceResponse> {
  const formData = new FormData();
  formData.append('xml', file);
  formData.append('profileId', profileId);

  return apiClient<UploadInvoiceResponse>('/api/invoices/upload', {
    method: 'POST',
    body: formData,
    requireAuth: true,
  });
}

/**
 * Elimina una factura por ID (Client Component only)
 */
export async function deleteInvoice(invoiceId: string): Promise<DeleteInvoiceResponse> {
  return apiClient<DeleteInvoiceResponse>(`/api/invoices/${invoiceId}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
