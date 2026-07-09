import { cache } from "react";
import { serverApiClient } from "./server-client";
import type { GetExpensesResponse } from "@/lib/types/expenses";

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

async function fetchExpenses(
  profileId: string | undefined,
  mes: number | undefined,
  año: number | undefined,
  regimenFiscal: string | undefined,
  tipo: string | undefined,
  categoria: string | undefined,
  page: number | undefined,
  limit: number | undefined,
  search: string | undefined
): Promise<GetExpensesResponse> {
  const queryParams = new URLSearchParams();

  if (profileId) queryParams.append("profileId", profileId);
  if (mes) queryParams.append("mes", mes.toString());
  if (año) queryParams.append("año", año.toString());
  if (regimenFiscal) queryParams.append("regimen_fiscal", regimenFiscal);
  if (tipo) queryParams.append("tipo", tipo);
  if (categoria) queryParams.append("categoria", categoria);
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());
  if (search) queryParams.append("search", search);

  const queryString = queryParams.toString();
  const endpoint = `/api/expenses${queryString ? `?${queryString}` : ""}`;

  return serverApiClient<GetExpensesResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}

const cachedFetchExpenses = cache(fetchExpenses);

/**
 * Obtiene los gastos del usuario (Server Component only)
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getExpenses(
  params?: GetExpensesParams
): Promise<GetExpensesResponse> {
  return cachedFetchExpenses(
    params?.profileId,
    params?.mes,
    params?.año,
    params?.regimen_fiscal,
    params?.tipo,
    params?.categoria,
    params?.page,
    params?.limit,
    params?.search
  );
}
