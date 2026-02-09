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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Obtiene los planes públicos sin autenticación (Server Component only).
 * Usa fetch directo sin cookies para permitir pre-render estático de la landing (/).
 * @param billing - Tipo de facturación: "monthly" o "annual" (default: "monthly")
 */
export async function getPublicPlans(
  billing: 'monthly' | 'annual' = 'monthly'
): Promise<PublicPlansResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('billing', billing);

  const response = await fetch(
    `${API_URL}/api/subscription/public-plans?${queryParams.toString()}`,
    {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 }, // cache 5 min
    }
  );

  if (!response.ok) {
    throw new Error(`Public plans: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<PublicPlansResponse>;
}
