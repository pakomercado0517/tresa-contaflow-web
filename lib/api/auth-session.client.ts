/**
 * Auth de sesión vía BFF (/backend): el API setea cookies httpOnly.
 * El cliente solo usa user / errores; no persiste ni reenvía JWT del JSON.
 */

export interface AuthSessionResult {
  error?: string;
  emailVerified?: boolean;
}

interface AuthErrorBody {
  error?: string;
  message?: string;
}

interface AuthUserBody {
  email_verified?: boolean;
}

interface AuthSuccessBody {
  user?: AuthUserBody;
}

function getAuthErrorMessage(data: AuthErrorBody, fallback: string): string {
  return data.error || data.message || fallback;
}

/**
 * Login email/password. Las cookies las setea el API vía rewrite.
 */
export async function loginWithPassword(
  email: string,
  password: string
): Promise<AuthSessionResult> {
  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' };
  }

  try {
    const response = await fetch('/backend/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as AuthErrorBody & AuthSuccessBody;

    if (!response.ok) {
      return { error: getAuthErrorMessage(data, 'Error al iniciar sesión') };
    }

    return { emailVerified: data.user?.email_verified === true };
  } catch {
    return { error: 'Error al iniciar sesión. Intenta nuevamente.' };
  }
}

/**
 * Login Google con Firebase ID token. Las cookies las setea el API vía rewrite.
 */
export async function loginWithGoogleIdToken(
  idToken: string
): Promise<AuthSessionResult> {
  if (!idToken?.trim()) {
    return { error: 'Token de Google no recibido' };
  }

  try {
    const response = await fetch('/backend/api/auth/google', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const data = (await response.json()) as AuthErrorBody & AuthSuccessBody;

    if (!response.ok) {
      return {
        error: getAuthErrorMessage(data, 'Error al iniciar sesión con Google'),
      };
    }

    return { emailVerified: data.user?.email_verified === true };
  } catch {
    return { error: 'Error al iniciar sesión con Google. Intenta nuevamente.' };
  }
}

/**
 * Renueva el access token (cookie) vía API. No lee ni usa JWT del body.
 */
export async function refreshSessionCookies(): Promise<boolean> {
  try {
    const response = await fetch('/backend/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return response.ok;
  } catch {
    return false;
  }
}
