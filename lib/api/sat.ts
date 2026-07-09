/**
 * Funciones server-side para el catálogo SAT
 * Usar en Server Components y Server Actions
 */

import { serverApiClient } from "./server-client";
import type {
  SATSimilarityResponse,
  SATStatsResponse,
  GetRegimenesFiscalesResponse,
} from "@/lib/types/sat";

const BASE_PATH = "/api/sat";

/**
 * Búsqueda avanzada por similitud usando pg_trgm
 */
export async function searchSATSimilarity(
  query: string,
  limit: number = 20
): Promise<SATSimilarityResponse> {
  const searchParams = new URLSearchParams({
    query,
    limit: Math.min(limit, 50).toString(), // Máximo 50 según docs
  });

  return serverApiClient<SATSimilarityResponse>(
    `${BASE_PATH}/similarity?${searchParams.toString()}`,
    {
      method: "GET",
      redirectOnAuthError: true,
    }
  );
}

/**
 * Obtiene estadísticas generales del catálogo SAT
 */
export async function getSATStats(): Promise<SATStatsResponse> {
  return serverApiClient<SATStatsResponse>(`${BASE_PATH}/stats`, {
    method: "GET",
    redirectOnAuthError: true,
  });
}

/**
 * Obtiene el catálogo de regímenes fiscales (server-side).
 * Opcionalmente filtra por tipo de persona.
 */
export async function getRegimenesFiscales(
  tipoPersona?: "FISICA" | "MORAL"
): Promise<GetRegimenesFiscalesResponse> {
  const params = tipoPersona
    ? `?tipo_persona=${tipoPersona}`
    : "";
  return serverApiClient<GetRegimenesFiscalesResponse>(
    `${BASE_PATH}/regimenes-fiscales${params}`,
    {
      method: "GET",
      redirectOnAuthError: true,
    }
  );
}
