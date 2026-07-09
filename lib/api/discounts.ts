import { serverApiClient } from "./server-client";
import type { GetDiscountCodesResponse } from "@/lib/types/discounts";

/**
 * Obtiene todos los códigos de descuento (Server Component only)
 * Requiere permisos de administrador
 */
export async function getDiscountCodes(
  filters?: {
    active?: boolean;
    code?: string;
  }
): Promise<GetDiscountCodesResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.active !== undefined) {
    queryParams.append("active", String(filters.active));
  }
  if (filters?.code) {
    queryParams.append("code", filters.code);
  }

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/discounts?${queryString}`
    : "/api/discounts";

  return serverApiClient<GetDiscountCodesResponse>(endpoint, {
    redirectOnAuthError: true,
  });
}
