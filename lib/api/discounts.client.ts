import { apiClient } from "./client";
import type {
  CreateDiscountCodeRequest,
  CreateDiscountCodeResponse,
  GetDiscountCodesResponse,
  ActivateDiscountCodeResponse,
  DeactivateDiscountCodeResponse,
} from "@/lib/types/discounts";

/**
 * Crea un nuevo código de descuento (Client Component)
 * Requiere permisos de administrador
 */
export async function createDiscountCodeClient(
  data: CreateDiscountCodeRequest
): Promise<CreateDiscountCodeResponse> {
  return apiClient<CreateDiscountCodeResponse>("/api/discounts", {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth: true,
  });
}

/**
 * Obtiene todos los códigos de descuento (Client Component)
 * Requiere permisos de administrador
 */
export async function getDiscountCodesClient(
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

  return apiClient<GetDiscountCodesResponse>(endpoint, {
    requireAuth: true,
  });
}

/**
 * Activa un código de descuento (Client Component)
 * Requiere permisos de administrador
 */
export async function activateDiscountCodeClient(
  id: string
): Promise<ActivateDiscountCodeResponse> {
  return apiClient<ActivateDiscountCodeResponse>(
    `/api/discounts/${id}/activate`,
    {
      method: "PATCH",
      requireAuth: true,
    }
  );
}

/**
 * Desactiva un código de descuento (Client Component)
 * Requiere permisos de administrador
 */
export async function deactivateDiscountCodeClient(
  id: string
): Promise<DeactivateDiscountCodeResponse> {
  return apiClient<DeactivateDiscountCodeResponse>(
    `/api/discounts/${id}/deactivate`,
    {
      method: "PATCH",
      requireAuth: true,
    }
  );
}
