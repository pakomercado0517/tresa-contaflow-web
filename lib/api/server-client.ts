/**
 * Cliente HTTP para Server Components
 * Los Server Components NO pueden refrescar tokens (Set-Cookie del API no llega al browser desde aquí).
 * Si reciben 401, redirigen automáticamente a login.
 *
 * Auth: reenvía cookies httpOnly (accessToken / refreshToken) al API.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ServerApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

interface ServerApiClientOptions extends RequestInit {
  redirectOnAuthError?: boolean; // Si debe redirigir a login cuando falla la autenticación (default: true)
  /** Si el servidor responde 404, devolver este valor en lugar de lanzar (ej. métricas vacías para usuarios sin suscripción) */
  notFoundDefault?: unknown;
}

function buildCookieHeader(
  accessToken: string | undefined,
  refreshToken: string | undefined
): string | undefined {
  const parts: string[] = [];
  if (accessToken) {
    parts.push(`accessToken=${accessToken}`);
  }
  if (refreshToken) {
    parts.push(`refreshToken=${refreshToken}`);
  }
  return parts.length > 0 ? parts.join("; ") : undefined;
}

/**
 * Cliente HTTP para Server Components
 *
 * IMPORTANTE: Los Server Components NO pueden refrescar tokens porque el Set-Cookie
 * de un fetch server-side no actualiza las cookies del browser.
 * Si se recibe un 401, se redirige automáticamente a /auth/login.
 *
 * El refresh automático de tokens solo funciona en Client Components a través de apiClient.
 */
export async function serverApiClient<T>(
  endpoint: string,
  options?: ServerApiClientOptions
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const cookieHeader = buildCookieHeader(accessToken, refreshToken);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(cookieHeader && { Cookie: cookieHeader }),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    // Evitar caché HTTP entre requests; la dedupe del mismo render la hace React.cache / Next fetch memo.
    cache: options?.cache ?? "no-store",
  });

  const data = await response.json().catch(() => ({}));

  // Si recibimos 401, redirigir a login
  // Los Server Components no pueden refrescar tokens (no pueden modificar cookies del browser)
  if (response.status === 401) {
    if (options?.redirectOnAuthError !== false) {
      redirect("/auth/login");
    }

    throw new ServerApiError(
      "Sesión expirada. Por favor inicia sesión nuevamente.",
      401,
      data
    );
  }

  // 404 con valor por defecto (ej. métricas vacías para usuarios sin suscripción)
  if (response.status === 404 && options?.notFoundDefault !== undefined) {
    return options.notFoundDefault as T;
  }

  if (!response.ok) {
    throw new ServerApiError(
      data.error || data.message || "API Error",
      response.status,
      data
    );
  }

  return data as T;
}
