/**
 * Utilidad para obtener la ruta administrativa de códigos de descuento
 * 
 * La ruta se configura mediante la variable de entorno ADMIN_DISCOUNT_ROUTE
 * Si no está configurada, usa la ruta por defecto: /internal/discount-management
 * 
 * IMPORTANTE: Esta variable NO debe ser pública (no usar NEXT_PUBLIC_)
 * para mantener la ruta oculta del código del cliente.
 * 
 * Para configurar, agrega en tu .env.local:
 * ADMIN_DISCOUNT_ROUTE=tu-ruta-personalizada
 * 
 * Ejemplo: ADMIN_DISCOUNT_ROUTE=admin/promociones-secretas
 */

/**
 * Obtiene la ruta administrativa configurada en las variables de entorno
 * @returns La ruta administrativa (sin el slash inicial)
 */
export function getAdminDiscountRoute(): string {
  // Variable de entorno privada (no NEXT_PUBLIC_) para mantenerla oculta
  const route = process.env.ADMIN_DISCOUNT_ROUTE;
  
  // Si no está configurada, usar la ruta por defecto
  return route || "internal/discount-management";
}

/**
 * Obtiene la URL completa de la ruta administrativa
 * Útil para redirecciones o enlaces en el servidor
 */
export function getAdminDiscountUrl(): string {
  const route = getAdminDiscountRoute();
  // Asegurar que no tenga slash inicial
  const cleanRoute = route.startsWith("/") ? route.slice(1) : route;
  return `/${cleanRoute}`;
}

/**
 * Obtiene la URL completa con el dominio
 * Útil para generar enlaces completos
 */
export function getAdminDiscountFullUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const route = getAdminDiscountUrl();
  return `${baseUrl}${route}`;
}
