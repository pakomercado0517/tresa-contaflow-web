import { serverApiClient } from "./server-client";
import { apiClient } from "./client";
import type {
  GetInvoicesResponse,
  MetricsResponse,
  UploadInvoiceResponse,
} from "@/lib/types/invoices";

interface GetInvoicesParams {
  profileId?: string;
  mes?: number;
  año?: number;
  tipo?: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Obtiene las facturas del usuario (Server Component only)
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getInvoices(
  params?: GetInvoicesParams
): Promise<GetInvoicesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.profileId) queryParams.append("profileId", params.profileId);
  if (params?.mes) queryParams.append("mes", params.mes.toString());
  if (params?.año) queryParams.append("año", params.año.toString());
  if (params?.tipo) queryParams.append("tipo", params.tipo);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/invoices${queryString ? `?${queryString}` : ""}`;

  return serverApiClient<GetInvoicesResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}

/**
 * Obtiene las métricas del usuario (Server Component only)
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getMetrics(
  profileId?: string,
  mes?: number,
  año?: number
): Promise<MetricsResponse> {
  const queryParams = new URLSearchParams();

  if (profileId) queryParams.append("profileId", profileId);
  if (mes) queryParams.append("mes", mes.toString());
  if (año) queryParams.append("año", año.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/invoices/metrics${queryString ? `?${queryString}` : ""}`;

  return serverApiClient<MetricsResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}

/**
 * Obtiene datos de tendencia mensual (Server Component only)
 * Solo hace peticiones hasta el mes actual del año para optimizar
 * Si el año es pasado, obtiene todos los 12 meses
 */
export async function getTrendData(
  profileId?: string,
  año?: number
): Promise<Array<{ mes: number; año: number; ingresos: number; gastos: number }>> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
  const year = año || currentYear;
  
  // Si es el año actual, incluir últimos 3 meses del año anterior
  // Si es un año pasado, obtener todos los 12 meses
  const monthsToFetch = year < currentYear ? 12 : currentMonth;
  const shouldIncludePrevYearTail = year === currentYear;
  const previousYear = year - 1;

  const currentYearPromises = Array.from({ length: monthsToFetch }, (_, i) =>
    getMetrics(profileId, i + 1, year)
  );

  const previousYearMonths = [10, 11, 12];
  const previousYearPromises = shouldIncludePrevYearTail
    ? previousYearMonths.map((mes) => getMetrics(profileId, mes, previousYear))
    : [];

  const [currentYearResults, previousYearResults] = await Promise.all([
    Promise.all(currentYearPromises),
    Promise.all(previousYearPromises),
  ]);

  const previousYearData = shouldIncludePrevYearTail
    ? previousYearMonths.map((mes, index) => ({
        mes,
        año: previousYear,
        ingresos: previousYearResults[index]?.metrics.totalFacturado || 0,
        gastos: previousYearResults[index]?.metrics.totalCompras || 0,
      }))
    : [];

  const currentYearData = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    if (mes <= monthsToFetch && currentYearResults[i]) {
      return {
        mes,
        año: year,
        ingresos: currentYearResults[i].metrics.totalFacturado,
        gastos: currentYearResults[i].metrics.totalCompras,
      };
    }
    return {
      mes,
      año: year,
      ingresos: 0,
      gastos: 0,
    };
  });

  return [...previousYearData, ...currentYearData];
}

/**
 * Sube un archivo XML de factura al backend (Client Component only)
 * El sistema determina automáticamente si es factura o gasto basándose en el RFC
 */
export async function uploadInvoice(
  file: File,
  profileId: string
): Promise<UploadInvoiceResponse> {
  const formData = new FormData();
  formData.append("xml", file);
  formData.append("profileId", profileId);

  return apiClient<UploadInvoiceResponse>("/api/invoices/upload", {
    method: "POST",
    body: formData,
    requireAuth: true,
  });
}
