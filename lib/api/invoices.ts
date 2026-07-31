import { cache } from 'react';
import { serverApiClient } from './server-client';
import type { GetInvoicesResponse } from '@/lib/types/invoices';
import {
  DEFAULT_PERIOD_METRICS,
  type PeriodMetricsResponse,
} from '@/lib/types/metrics';

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
async function fetchInvoices(
  profileId: string | undefined,
  mes: number | undefined,
  año: number | undefined,
  regimenFiscal: string | undefined,
  page: number | undefined,
  limit: number | undefined,
  search: string | undefined
): Promise<GetInvoicesResponse> {
  const queryParams = new URLSearchParams();

  if (profileId) queryParams.append('profileId', profileId);
  if (mes) queryParams.append('mes', mes.toString());
  if (año) queryParams.append('año', año.toString());
  if (regimenFiscal) queryParams.append('regimen_fiscal', regimenFiscal);
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (search) queryParams.append('search', search);

  const queryString = queryParams.toString();
  const endpoint = `/api/invoices${queryString ? `?${queryString}` : ''}`;

  return serverApiClient<GetInvoicesResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}

const cachedFetchInvoices = cache(fetchInvoices);

export async function getInvoices(params?: GetInvoicesParams): Promise<GetInvoicesResponse> {
  return cachedFetchInvoices(
    params?.profileId,
    params?.mes,
    params?.año,
    params?.regimen_fiscal,
    params?.page,
    params?.limit,
    params?.search
  );
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
 * Modos de visualización para la tendencia
 */
export type TrendPeriodView =
  | 'últimos-3-meses'
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
