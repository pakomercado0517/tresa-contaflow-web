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
 * Obtiene datos de tendencia mensual para el año completo (Server Component only)
 * Hace 12 llamadas a getMetrics (una por mes) y agrega los resultados
 */
export async function getTrendData(
  profileId?: string,
  año?: number
): Promise<Array<{ mes: number; ingresos: number; gastos: number }>> {
  const year = año || new Date().getFullYear();
  const promises = Array.from({ length: 12 }, (_, i) =>
    getMetrics(profileId, i + 1, year)
  );
  const results = await Promise.all(promises);
  return results.map((result, i) => ({
    mes: i + 1,
    ingresos: result.metrics.totalFacturado,
    gastos: result.metrics.totalCompras,
  }));
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
