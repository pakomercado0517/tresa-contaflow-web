/**
 * Ventana móvil de charts de tendencia: puntos hasta (mesCorte, añoCorte),
 * los más recientes primero en el tiempo (últimos `maxPoints`).
 */
export function sliceTrendDataForMobileWindow<T extends { mes: number; año: number }>(
  points: T[],
  mesCorte: number,
  añoCorte: number,
  maxPoints: number
): T[] {
  const cutoffKey = añoCorte * 12 + mesCorte;
  const upToCutoff = points.filter((point) => point.año * 12 + point.mes <= cutoffKey);

  if (upToCutoff.length === 0) {
    return points.slice(-maxPoints);
  }

  return upToCutoff.slice(-maxPoints);
}
