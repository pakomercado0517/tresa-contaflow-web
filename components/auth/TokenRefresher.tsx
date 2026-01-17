"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logger } from "@/lib/utils/logger";

/**
 * Componente que refresca el access token automáticamente cada 12 minutos
 * para mantener la sesión activa mientras el usuario está en la aplicación.
 * 
 * El access token expira en 15 minutos, por lo que lo refrescamos antes
 * para evitar interrupciones en la experiencia del usuario.
 */
export function TokenRefresher() {
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo ejecutar en rutas protegidas (dashboard)
    const isProtectedRoute = pathname?.startsWith("/dashboard");
    
    if (!isProtectedRoute) {
      return;
    }

    // Función para refrescar el token
    const refreshToken = async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          logger.info("Token refrescado automáticamente");
        } else {
          const data = await response.json();
          // Si el refresh token expiró, redirigir a login
          if (response.status === 401 || data.redirect) {
            logger.warn("Refresh token expirado, redirigiendo a login");
            window.location.href = "/auth/login";
          }
        }
      } catch (error) {
        logger.error("Error al refrescar token", error);
      }
    };

    // Refrescar inmediatamente al montar (útil si acabamos de cargar la página)
    refreshToken();

    // Configurar intervalo para refrescar cada 12 minutos (720,000 ms)
    // El token expira en 15 minutos, así que esto da un margen de 3 minutos
    intervalRef.current = setInterval(refreshToken, 12 * 60 * 1000);

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname]);

  // Este componente no renderiza nada visible
  return null;
}

