import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface AuthenticatedSession {
  hasSession: true;
}

/**
 * Verifica que la petición tenga sesión (cookie accessToken) antes de mutaciones en dashboard.
 */
export async function requireAuth(): Promise<AuthenticatedSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/auth/login');
  }

  return { hasSession: true };
}
