import { serverApiClient } from "./server-client";
import type {
  CreateDiscountCodeRequest,
  CreateDiscountCodeResponse,
  GetDiscountCodesResponse,
  ActivateDiscountCodeResponse,
  DeactivateDiscountCodeResponse,
} from "@/lib/types/discounts";

/**
 * Crea un nuevo código de descuento (Server Component only)
 * Requiere permisos de administrador
 */
export async function createDiscountCode(
  data: CreateDiscountCodeRequest
): Promise<CreateDiscountCodeResponse> {
  return serverApiClient<CreateDiscountCodeResponse>("/api/discounts", {
    method: "POST",
    body: JSON.stringify(data),
    redirectOnAuthError: true,
  });
}

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

/**
 * Activa un código de descuento (Server Component only)
 * Requiere permisos de administrador
 */
export async function activateDiscountCode(
  id: string
): Promise<ActivateDiscountCodeResponse> {
  return serverApiClient<ActivateDiscountCodeResponse>(
    `/api/discounts/${id}/activate`,
    {
      method: "PATCH",
      redirectOnAuthError: true,
    }
  );
}

/**
 * Desactiva un código de descuento (Server Component only)
 * Requiere permisos de administrador
 */
export async function deactivateDiscountCode(
  id: string
): Promise<DeactivateDiscountCodeResponse> {
  return serverApiClient<DeactivateDiscountCodeResponse>(
    `/api/discounts/${id}/deactivate`,
    {
      method: "PATCH",
      redirectOnAuthError: true,
    }
  );
}
