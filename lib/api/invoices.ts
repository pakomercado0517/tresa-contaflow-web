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
): Promise<Array<{ mes: number; ingresos: number; gastos: number }>> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
  const year = año || currentYear;
  
  // Si es el año actual, solo obtener hasta el mes actual
  // Si es un año pasado, obtener todos los 12 meses
  const monthsToFetch = year < currentYear ? 12 : currentMonth;
  
  // Crear array de promesas solo para los meses necesarios
  const promises = Array.from({ length: monthsToFetch }, (_, i) =>
    getMetrics(profileId, i + 1, year)
  );
  
  const results = await Promise.all(promises);
  
  // Mapear resultados y rellenar con ceros los meses futuros
  const trendData = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    if (mes <= monthsToFetch && results[i]) {
      return {
        mes,
        ingresos: results[i].metrics.totalFacturado,
        gastos: results[i].metrics.totalCompras,
      };
    }
    // Meses futuros o sin datos
    return {
      mes,
      ingresos: 0,
      gastos: 0,
    };
  });
  
  return trendData;
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
