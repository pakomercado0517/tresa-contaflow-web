import { serverApiClient } from "./server-client";
import type { GetExpensesResponse } from "@/lib/types/expenses";

interface GetExpensesParams {
  profileId?: string;
  mes?: number;
  año?: number;
  tipo?: string;
  categoria?: string;
  page?: number;
  limit?: number;
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
  if (params?.tipo) queryParams.append("tipo", params.tipo);
  if (params?.categoria) queryParams.append("categoria", params.categoria);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/expenses${queryString ? `?${queryString}` : ""}`;

  return serverApiClient<GetExpensesResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}

