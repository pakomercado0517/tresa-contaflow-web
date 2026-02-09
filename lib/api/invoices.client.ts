import { apiClient } from './client';
import type {
  UploadInvoiceResponse,
  DeleteInvoiceResponse,
  GetInvoicesResponse,
} from '@/lib/types/invoices';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';
import type { TrendPeriodView } from './invoices';

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

export type TrendDataPoint = {
  mes: number;
  año: number;
  ingresos_cobrados: number;
  egresos_pagados: number;
  ingresos_devengados: number;
  egresos_devengados: number;
};

/**
 * Obtiene las métricas del usuario (Client Component only)
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
  });
}

/**
 * Obtiene datos de tendencia mensual (Client Component only)
 * Permite diferentes modos de visualización
 */
export async function getTrendDataClient(
  profileId?: string,
  año?: number,
  periodView: TrendPeriodView = 'año-actual',
  mesCorte?: number,
  regimenFiscal?: string
): Promise<TrendDataPoint[]> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
  const year = año || currentYear;

  const clampedMesCorte = mesCorte ? Math.min(12, Math.max(1, mesCorte)) : undefined;
  const currentYearCutoffMonth =
    year === currentYear
      ? Math.min(clampedMesCorte ?? currentMonth, currentMonth)
      : clampedMesCorte;

  let monthsToFetch = 12;
  let shouldIncludePrevYearTail = false;
  let shouldFetchLast12Months = false;

  switch (periodView) {
    case 'año-actual':
      // Solo el año seleccionado hasta el mes actual
      monthsToFetch =
        year < currentYear
          ? 12
          : year === currentYear
            ? (currentYearCutoffMonth ?? currentMonth)
            : (currentYearCutoffMonth ?? 12);
      break;
    case 'últimos-12-meses':
      // Rolling window de últimos 12 meses
      shouldFetchLast12Months = true;
      break;
    case 'año-completo':
      // Todos los 12 meses del año seleccionado
      monthsToFetch = 12;
      break;
    case 'comparar-anterior':
      // Año actual + últimos 3 meses del año anterior (solo si es el año actual)
      if (year === currentYear) {
        monthsToFetch = currentYearCutoffMonth ?? currentMonth;
        shouldIncludePrevYearTail = true;
      } else {
        monthsToFetch = 12;
      }
      break;
  }

  const previousYear = year - 1;

  // Si necesitamos los últimos 12 meses, calcular qué meses/años necesitamos
  if (shouldFetchLast12Months) {
    const months: Array<{ mes: number; año: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      months.push({
        mes: date.getMonth() + 1,
        año: date.getFullYear(),
      });
    }

    const promises = months.map(({ mes, año }) =>
      getMetricsClient(profileId, mes, año, regimenFiscal)
    );
    const results = await Promise.all(promises);

    return months.map(({ mes, año }, index) => ({
      mes,
      año,
      ingresos_cobrados: results[index]?.flujo.ingresos_cobrados ?? 0,
      egresos_pagados: results[index]?.flujo.egresos_pagados ?? 0,
      ingresos_devengados: results[index]?.devengado.ingresos_devengados ?? 0,
      egresos_devengados: results[index]?.devengado.egresos_devengados ?? 0,
    }));
  }

  // Para los otros modos
  const currentYearPromises = Array.from({ length: monthsToFetch }, (_, i) =>
    getMetricsClient(profileId, i + 1, year, regimenFiscal)
  );

  const previousYearMonths = [10, 11, 12];
  const previousYearPromises = shouldIncludePrevYearTail
    ? previousYearMonths.map((mes) =>
        getMetricsClient(profileId, mes, previousYear, regimenFiscal)
      )
    : [];

  const [currentYearResults, previousYearResults] = await Promise.all([
    Promise.all(currentYearPromises),
    Promise.all(previousYearPromises),
  ]);

  const previousYearData = shouldIncludePrevYearTail
    ? previousYearMonths.map((mes, index) => ({
        mes,
        año: previousYear,
        ingresos_cobrados: previousYearResults[index]?.flujo.ingresos_cobrados ?? 0,
        egresos_pagados: previousYearResults[index]?.flujo.egresos_pagados ?? 0,
        ingresos_devengados: previousYearResults[index]?.devengado.ingresos_devengados ?? 0,
        egresos_devengados: previousYearResults[index]?.devengado.egresos_devengados ?? 0,
      }))
    : [];

  const currentYearData = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    if (mes <= monthsToFetch && currentYearResults[i]) {
      return {
        mes,
        año: year,
        ingresos_cobrados: currentYearResults[i].flujo.ingresos_cobrados,
        egresos_pagados: currentYearResults[i].flujo.egresos_pagados,
        ingresos_devengados: currentYearResults[i].devengado.ingresos_devengados,
        egresos_devengados: currentYearResults[i].devengado.egresos_devengados,
      };
    }
    return {
      mes,
      año: year,
      ingresos_cobrados: 0,
      egresos_pagados: 0,
      ingresos_devengados: 0,
      egresos_devengados: 0,
    };
  });

  return [...previousYearData, ...currentYearData];
}

/**
 * Sube un archivo XML de factura al backend (Client Component only)
 * El sistema determina automáticamente si es factura o gasto basándose en el RFC
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
