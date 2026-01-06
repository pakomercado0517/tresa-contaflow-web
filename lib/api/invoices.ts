import { serverApiClient } from "./server-client";
import type {
  GetInvoicesResponse,
  MetricsResponse,
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

