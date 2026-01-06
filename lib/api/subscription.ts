import { serverApiClient } from "./server-client";
import type {
  GetSubscriptionResponse,
  CreatePortalSessionResponse,
} from "@/lib/types/subscription";

/**
 * Obtiene la suscripción del usuario (Server Component only)
 * Esta función debe ser llamada solo desde Server Components o Server Actions
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getSubscription(): Promise<GetSubscriptionResponse> {
  return serverApiClient<GetSubscriptionResponse>("/api/subscription", {
    redirectOnAuthError: true,
  });
}

/**
 * Crea una sesión del portal de Stripe (Server Component only)
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function createPortalSession(): Promise<CreatePortalSessionResponse> {
  return serverApiClient<CreatePortalSessionResponse>(
    "/api/subscription/create-portal-session",
    {
      method: "POST",
      redirectOnAuthError: true,
    }
  );
}

