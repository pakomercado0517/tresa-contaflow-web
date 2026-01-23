/**
 * Funciones client-side para el catálogo SAT
 * Usar en Client Components con React Query o directamente
 */

import { apiClient } from "./client";
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
export async function searchSATProductsClient(
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

  return apiClient<SATProductServiceSearchResponse>(endpoint, {
    method: "GET",
    requireAuth: true,
  });
}

/**
 * Búsqueda avanzada por similitud usando pg_trgm
 */
export async function searchSATSimilarityClient(
  query: string,
  limit: number = 20
): Promise<SATSimilarityResponse> {
  const searchParams = new URLSearchParams({
    query,
    limit: Math.min(limit, 50).toString(),
  });

  return apiClient<SATSimilarityResponse>(
    `${BASE_PATH}/similarity?${searchParams.toString()}`,
    {
      method: "GET",
      requireAuth: true,
    }
  );
}

/**
 * Obtiene sugerencias de búsqueda para autocompletado
 */
export async function getSATSuggestionsClient(
  q: string,
  limit: number = 10
): Promise<SATSuggestionsResponse> {
  const searchParams = new URLSearchParams({
    q,
    limit: Math.min(limit, 20).toString(),
  });

  return apiClient<SATSuggestionsResponse>(
    `${BASE_PATH}/suggestions?${searchParams.toString()}`,
    {
      method: "GET",
      requireAuth: true,
    }
  );
}

/**
 * Obtiene un producto/servicio específico por su clave
 */
export async function getSATProductByIdClient(
  id: string
): Promise<SATProductServiceAttributes> {
  return apiClient<SATProductServiceAttributes>(`${BASE_PATH}/${id}`, {
    method: "GET",
    requireAuth: true,
  });
}

/**
 * Obtiene estadísticas generales del catálogo SAT
 */
export async function getSATStatsClient(): Promise<SATStatsResponse> {
  return apiClient<SATStatsResponse>(`${BASE_PATH}/stats`, {
    method: "GET",
    requireAuth: true,
  });
}
