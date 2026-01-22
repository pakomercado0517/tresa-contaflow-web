/**
 * Funciones server-side para el catálogo SAT
 * Usar en Server Components y Server Actions
 */

import { serverApiClient } from "./server-client";
import type {
  SATProductServiceAttributes,
  SATProductServiceSearchParams,
  SATProductServiceSearchResponse,
  SATSimilarityResponse,
  SATSuggestionsResponse,
  SATStatsResponse,
} from "@/lib/types/sat";

const BASE_PATH = "/api/sat";

/**
 * Busca productos/servicios del SAT con filtros y paginación
 */
export async function searchSATProducts(
  params: SATProductServiceSearchParams = {}
): Promise<SATProductServiceSearchResponse> {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.append("query", params.query);
  }
  if (params.incluir_iva_trasladado) {
    searchParams.append("incluir_iva_trasladado", params.incluir_iva_trasladado);
  }
  if (params.incluir_ieps_trasladado) {
    searchParams.append("incluir_ieps_trasladado", params.incluir_ieps_trasladado);
  }
  if (params.limit) {
    searchParams.append("limit", params.limit.toString());
  }
  if (params.offset) {
    searchParams.append("offset", params.offset.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = `${BASE_PATH}/search${queryString ? `?${queryString}` : ""}`;

  return serverApiClient<SATProductServiceSearchResponse>(endpoint, {
    method: "GET",
    redirectOnAuthError: true,
  });
}

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
 * Obtiene sugerencias de búsqueda para autocompletado
 */
export async function getSATSuggestions(
  q: string,
  limit: number = 10
): Promise<SATSuggestionsResponse> {
  const searchParams = new URLSearchParams({
    q,
    limit: Math.min(limit, 20).toString(), // Máximo 20 según docs
  });

  return serverApiClient<SATSuggestionsResponse>(
    `${BASE_PATH}/suggestions?${searchParams.toString()}`,
    {
      method: "GET",
      redirectOnAuthError: true,
    }
  );
}

/**
 * Obtiene un producto/servicio específico por su clave
 */
export async function getSATProductById(
  id: string
): Promise<SATProductServiceAttributes> {
  return serverApiClient<SATProductServiceAttributes>(`${BASE_PATH}/${id}`, {
    method: "GET",
    redirectOnAuthError: true,
  });
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
