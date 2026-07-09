import { cache } from 'react';
import { serverApiClient } from './server-client';
import type { GetInvoicesResponse } from '@/lib/types/invoices';
import {
  createEmptyMetricsRangeResponse,
  type GetMetricsRangeParams,
  type MetricsRangeResponse,
  DEFAULT_PERIOD_METRICS,
  type PeriodMetricsResponse,
} from '@/lib/types/metrics';
import { appendMetricsRangeQueryParams, trendBoundsToMetricsRangeBounds } from './metrics-range-query';
import { getTrendRangeBounds } from '@/lib/utils/metrics-trend-range';

interface GetInvoicesParams {
  profileId?: string;
  mes?: number;
  año?: number;
  regimen_fiscal?: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Obtiene las facturas del usuario (Server Component only)
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getInvoices(params?: GetInvoicesParams): Promise<GetInvoicesResponse> {
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

  return serverApiClient<GetInvoicesResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}

async function fetchMetrics(
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

  return serverApiClient<PeriodMetricsResponse>(endpoint, {
    redirectOnAuthError: true,
    notFoundDefault: DEFAULT_PERIOD_METRICS,
  });
}

export const getMetrics = cache(fetchMetrics);

/**
 * Argumentos primitivos: React.cache compara con Object.is;
 * un objeto params nuevo en cada llamada nunca reutiliza la caché del request.
 */
async function fetchMetricsRange(
  mesDesde: number,
  añoDesde: number,
  mesHasta: number,
  añoHasta: number,
  profileId?: string,
  regimenFiscal?: string
): Promise<MetricsRangeResponse> {
  const params: GetMetricsRangeParams = {
    mesDesde,
    añoDesde,
    mesHasta,
    añoHasta,
    profileId,
    regimenFiscal,
  };
  const queryParams = new URLSearchParams();
  appendMetricsRangeQueryParams(queryParams, params);

  const queryString = queryParams.toString();
  const endpoint = `/api/metrics?${queryString}`;

  const emptyDefault = createEmptyMetricsRangeResponse(
    trendBoundsToMetricsRangeBounds(params)
  );

  return serverApiClient<MetricsRangeResponse>(endpoint, {
    redirectOnAuthError: true,
    notFoundDefault: emptyDefault,
  });
}

export const getMetricsRange = cache(fetchMetricsRange);

/**
 * Modos de visualización para la tendencia
 */
export type TrendPeriodView =
  | 'año-actual'
  | 'últimos-12-meses'
  | 'año-completo'
  | 'comparar-anterior';

export interface TrendDataPoint {
  mes: number;
  año: number;
  ingresos_cobrados: number;
  egresos_pagados: number;
  ingresos_devengados: number;
  egresos_devengados: number;
}

/**
 * Rango de métricas para la vista por defecto del dashboard (año-actual) en SSR.
 */
export async function getDashboardTrendMetricsRange(
  profileId: string | undefined,
  año: number,
  mesCorte: number,
  regimenFiscal?: string
): Promise<MetricsRangeResponse> {
  const bounds = getTrendRangeBounds('año-actual', año, mesCorte);
  return getMetricsRange(
    bounds.mesDesde,
    bounds.añoDesde,
    bounds.mesHasta,
    bounds.añoHasta,
    profileId,
    regimenFiscal
  );
}
