interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
  skipAuthRetry?: boolean; // Para evitar loops infinitos en el refresh
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
let refreshPromise: Promise<string | null> | null = null;

/**
 * Obtiene el access token actual desde las cookies mediante una API route
 * @returns El access token o null si no está disponible
 */
async function getAccessToken(): Promise<string | null> {
  try {
    // Usar la API route de Next.js para leer las cookies httpOnly
    const response = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.accessToken || null;
  } catch (error) {
    console.error("Error al obtener token:", error);
    return null;
  }
}

/**
 * Intenta refrescar el access token usando el refresh token
 * @returns El nuevo access token o null si falla
 */
async function refreshAccessToken(): Promise<string | null> {
  // Si ya hay un refresh en proceso, esperar a que termine
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el refresh token también expiró, redirigir a login
        if (response.status === 401 || data.redirect) {
          // Limpiar cualquier estado local
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          return null;
        }
        return null;
      }

      return data.accessToken || null;
    } catch (error) {
      console.error("Error al refrescar token:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return null;
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
  const apiUrl = typeof window !== "undefined" 
    ? "/backend" // Proxy de Next.js (sin CORS)
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  // Solo agregar Content-Type si no es FormData
  // El browser setea automáticamente el Content-Type correcto para FormData (con boundary)
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Si se requiere autenticación, agregar el token al header
  if (options?.requireAuth && typeof window !== "undefined") {
    const accessToken = await getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  // Primera petición
  let response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  let data = await response.json().catch(() => ({}));

  // Si recibimos 401 y no estamos en un retry, intentar refrescar token
  if (
    response.status === 401 &&
    !options?.skipAuthRetry &&
    typeof window !== "undefined"
  ) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      // Reintentar la petición original con el nuevo token
      // Usar skipAuthRetry para evitar loops infinitos
      const retryOptions: ApiClientOptions = {
        ...options,
        skipAuthRetry: true,
      };

      const retryHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      
      response = await fetch(`${apiUrl}${endpoint}`, {
        ...retryOptions,
        credentials: "include",
        headers: retryHeaders,
      });

      data = await response.json().catch(() => ({}));
    } else {
      // Si el refresh falló, ya se redirigió a login
      throw new ApiError(
        "Sesión expirada. Redirigiendo a login...",
        401,
        data
      );
    }
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


