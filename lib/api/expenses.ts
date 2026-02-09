import { serverApiClient } from "./server-client";
import { apiClient } from "./client";
import type { GetExpensesResponse, UploadExpenseResponse } from "@/lib/types/expenses";

interface GetExpensesParams {
  profileId?: string;
  mes?: number;
  año?: number;
  regimen_fiscal?: string;
  tipo?: string;
  categoria?: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Obtiene los gastos del usuario (Server Component only)
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getExpenses(
  params?: GetExpensesParams
): Promise<GetExpensesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.profileId) queryParams.append("profileId", params.profileId);
  if (params?.mes) queryParams.append("mes", params.mes.toString());
  if (params?.año) queryParams.append("año", params.año.toString());
  if (params?.regimen_fiscal) queryParams.append("regimen_fiscal", params.regimen_fiscal);
  if (params?.tipo) queryParams.append("tipo", params.tipo);
  if (params?.categoria) queryParams.append("categoria", params.categoria);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/expenses${queryString ? `?${queryString}` : ""}`;

  return serverApiClient<GetExpensesResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}

/**
 * Sube un archivo XML de gasto al backend (Client Component only)
 * Nota: En realidad usa el mismo endpoint que invoices/upload
 * El sistema determina automáticamente si es factura o gasto basándose en el RFC
 */
export async function uploadExpense(
  file: File,
  profileId: string
): Promise<UploadExpenseResponse> {
  const formData = new FormData();
  formData.append("xml", file);
  formData.append("profileId", profileId);

  return apiClient<UploadExpenseResponse>("/api/invoices/upload", {
    method: "POST",
    body: formData,
    requireAuth: true,
  });
}
