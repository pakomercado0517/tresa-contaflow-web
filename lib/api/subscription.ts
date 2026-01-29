import { serverApiClient } from './server-client';
import type {
  GetSubscriptionResponse,
  CreatePortalSessionResponse,
  GetAvailablePlansResponse,
  PublicPlansResponse,
} from '@/lib/types/subscription';

/**
 * Obtiene la suscripción del usuario (Server Component only)
 * Esta función debe ser llamada solo desde Server Components o Server Actions
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getSubscription(): Promise<GetSubscriptionResponse> {
  return serverApiClient<GetSubscriptionResponse>('/api/subscription', {
    redirectOnAuthError: true,
  });
}

/**
 * Crea una sesión del portal de Stripe (Server Component only)
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function createPortalSession(): Promise<CreatePortalSessionResponse> {
  return serverApiClient<CreatePortalSessionResponse>('/api/subscription/create-portal-session', {
    method: 'POST',
    redirectOnAuthError: true,
  });
}

/**
 * Obtiene todos los planes disponibles (Server Component only)
 * @param billing - Tipo de facturación: "monthly" o "annual" (default: "monthly")
 * Maneja automáticamente el refresh de tokens cuando recibe 401
 */
export async function getAvailablePlans(
  billing: 'monthly' | 'annual' = 'monthly'
): Promise<GetAvailablePlansResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('billing', billing);

  return serverApiClient<GetAvailablePlansResponse>(
    `/api/subscription/plans?${queryParams.toString()}`,
    {
      redirectOnAuthError: true,
    }
  );
}

/**
 * Obtiene los planes públicos sin autenticación (Server Component only)
 * @param billing - Tipo de facturación: "monthly" o "annual" (default: "monthly")
 * Este endpoint no requiere autenticación
 */
export async function getPublicPlans(
  billing: 'monthly' | 'annual' = 'monthly'
): Promise<PublicPlansResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('billing', billing);

  return serverApiClient<PublicPlansResponse>(
    `/api/subscription/public-plans?${queryParams.toString()}`,
    {
      // No requiere autenticación (es público)
      requireAuth: false,
    }
  );
}
