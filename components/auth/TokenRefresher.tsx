'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import { refreshSessionCookies } from '@/lib/api/auth-session.client';

async function refreshSessionToken(): Promise<null> {
  const ok = await refreshSessionCookies();

  if (ok) {
    logger.debug('Token refrescado automáticamente');
    return null;
  }

  logger.warn('Refresh token expirado, redirigiendo a login');
  window.location.href = '/auth/login';
  return null;
}

/**
 * Mantiene la sesión activa en rutas del dashboard refrescando el access token
 * cada 12 minutos (expira a los 15) vía /backend/api/auth/refresh.
 */
export function TokenRefresher() {
  const pathname = usePathname();
  const isProtectedRoute = pathname?.startsWith('/dashboard');

  useQuery({
    queryKey: ['auth', 'token-refresh', pathname],
    queryFn: refreshSessionToken,
    enabled: isProtectedRoute,
    refetchInterval: 12 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 11 * 60 * 1000,
    retry: false,
  });

  return null;
}
