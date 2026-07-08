'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { logger } from '@/lib/utils/logger';

async function refreshSessionToken(): Promise<void> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  if (response.ok) {
    logger.info('Token refrescado automáticamente');
    return;
  }

  const data = (await response.json()) as { redirect?: boolean };
  if (response.status === 401 || data.redirect) {
    logger.warn('Refresh token expirado, redirigiendo a login');
    window.location.href = '/auth/login';
  }
}

/**
 * Mantiene la sesión activa en rutas del dashboard refrescando el access token
 * cada 12 minutos (expira a los 15).
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
