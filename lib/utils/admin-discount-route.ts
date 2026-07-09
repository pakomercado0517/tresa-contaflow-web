/** Ruta física en App Router (`app/internal/discount-management/`). */
export const INTERNAL_DISCOUNT_MANAGEMENT_PATH = 'internal/discount-management';

const ROUTE_SEGMENT_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/;

/**
 * Segmentos de URL pública (sin slash inicial) desde `ADMIN_DISCOUNT_ROUTE`.
 * Sin env válida → ruta interna por defecto.
 */
export function getAdminDiscountPublicRouteSegments(
  envValue: string | undefined = process.env.ADMIN_DISCOUNT_ROUTE
): string {
  const trimmed = envValue?.trim();
  if (!trimmed) {
    return INTERNAL_DISCOUNT_MANAGEMENT_PATH;
  }

  const normalized = trimmed.replace(/^\/+|\/+$/g, '');
  if (!normalized || !ROUTE_SEGMENT_PATTERN.test(normalized)) {
    return INTERNAL_DISCOUNT_MANAGEMENT_PATH;
  }

  return normalized;
}

export function isCustomAdminDiscountRoute(
  envValue: string | undefined = process.env.ADMIN_DISCOUNT_ROUTE
): boolean {
  return (
    getAdminDiscountPublicRouteSegments(envValue) !== INTERNAL_DISCOUNT_MANAGEMENT_PATH
  );
}
