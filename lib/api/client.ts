import { logger } from "@/lib/utils/logger";
import { refreshSessionCookies } from "@/lib/api/auth-session.client";

interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
  skipAuthRetry?: boolean; // Para evitar loops infinitos en el refresh
  /** Si el servidor responde 404, devolver este valor en lugar de lanzar (ej. métricas vacías para usuarios sin suscripción) */
  notFoundDefault?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Renueva cookies de sesión vía /backend (API Set-Cookie).
 * No lee ni usa JWT del body.
 */
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const ok = await refreshSessionCookies();

      if (!ok) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error al refrescar token", error);
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options?: ApiClientOptions
): Promise<T> {
  // Usar proxy de Next.js en el navegador para evitar problemas de CORS
  // En el servidor (SSR), usar la URL del backend directamente
  const apiUrl =
    typeof window !== "undefined"
      ? "/backend" // Proxy de Next.js (sin CORS); cookies httpOnly del origen Next
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  // Solo agregar Content-Type si no es FormData
  // El browser setea automáticamente el Content-Type correcto para FormData (con boundary)
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Auth en browser: cookies httpOnly vía credentials (sin Bearer / sin /api/auth/token)
  let response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  let data = await response.json().catch(() => ({}));

  // Si recibimos 401 y no estamos en un retry, intentar refrescar cookie de access
  if (
    response.status === 401 &&
    !options?.skipAuthRetry &&
    typeof window !== "undefined"
  ) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      const retryOptions: ApiClientOptions = {
        ...options,
        skipAuthRetry: true,
      };

      response = await fetch(`${apiUrl}${endpoint}`, {
        ...retryOptions,
        credentials: "include",
        headers,
      });

      data = await response.json().catch(() => ({}));
    } else {
      throw new ApiError(
        "Sesión expirada. Redirigiendo a login...",
        401,
        data
      );
    }
  }

  // 404 con valor por defecto (ej. métricas vacías para usuarios sin suscripción)
  if (response.status === 404 && options?.notFoundDefault !== undefined) {
    return options.notFoundDefault as T;
  }

  if (!response.ok) {
    throw new ApiError(
      data.error || data.message || "API Error",
      response.status,
      data
    );
  }

  return data as T;
}
