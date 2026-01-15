/**
 * API functions for subscription management (Client Components only)
 * These functions use the client-side API client with credentials
 */

import { apiClient } from "./client";
import type {
  GetSubscriptionResponse,
  CreateCheckoutResponse,
  CreatePortalSessionResponse,
  CreateCheckoutRequest,
} from "@/lib/types/subscription";

/**
 * Obtiene la suscripción del usuario (Client Component)
 * Usa el cliente HTTP con credentials para enviar cookies automáticamente
 */
export async function getSubscriptionClient(): Promise<GetSubscriptionResponse> {
  return apiClient<GetSubscriptionResponse>("/api/subscription", {
    requireAuth: true,
  });
}

/**
 * Crea una sesión de checkout de Stripe (Client Component)
 * Solo acepta planes BASIC y PRO
 * @param plan - Plan a suscribirse (BASIC o PRO)
 * @param promotionCode - Código de descuento opcional (3-50 caracteres)
 */
export async function createCheckoutSession(
  plan: "BASIC" | "PRO",
  promotionCode?: string
): Promise<CreateCheckoutResponse> {
  const body: CreateCheckoutRequest = { plan };
  
  // Solo agregar promotionCode si existe y no está vacío
  if (promotionCode && promotionCode.trim()) {
    body.promotionCode = promotionCode.trim().toUpperCase();
  }

  return apiClient<CreateCheckoutResponse>(
    "/api/subscription/create-checkout",
    {
      method: "POST",
      body: JSON.stringify(body),
      requireAuth: true,
    }
  );
}

/**
 * Crea una sesión del portal de Stripe (Client Component)
 * Solo funciona para usuarios con suscripciones de pago (BASIC/PRO)
 */
export async function createPortalSessionClient(): Promise<CreatePortalSessionResponse> {
  return apiClient<CreatePortalSessionResponse>(
    "/api/subscription/create-portal-session",
    {
      method: "POST",
      requireAuth: true,
    }
  );
}
