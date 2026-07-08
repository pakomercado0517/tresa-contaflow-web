/**
 * Funciones client-side para el catálogo SAT
 * Usar en Client Components con React Query o directamente
 */

import { apiClient } from "./client";
import type {
  SATStatsResponse,
  GetRegimenesFiscalesResponse,
} from "@/lib/types/sat";

const BASE_PATH = "/api/sat";

/**
 * Obtiene estadísticas generales del catálogo SAT
 */
export async function getSATStatsClient(): Promise<SATStatsResponse> {
  return apiClient<SATStatsResponse>(`${BASE_PATH}/stats`, {
    method: "GET",
    requireAuth: true,
  });
}

/**
 * Obtiene el catálogo de regímenes fiscales vigentes.
 * Opcionalmente filtra por tipo de persona del perfil.
 */
export async function getRegimenesFiscalesClient(
  tipoPersona?: "FISICA" | "MORAL"
): Promise<GetRegimenesFiscalesResponse> {
  const params = tipoPersona
    ? `?tipo_persona=${tipoPersona}`
    : "";
  return apiClient<GetRegimenesFiscalesResponse>(
    `${BASE_PATH}/regimenes-fiscales${params}`,
    {
      method: "GET",
      requireAuth: true,
    }
  );
}
