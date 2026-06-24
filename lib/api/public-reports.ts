import { apiClient } from './client';
import type {
  GeneratePublicReportRequest,
  GeneratePublicReportResponse,
  PublicReportResponse,
} from '@/lib/types/public-reports';

/**
 * Genera un link de acceso público para un perfil (Client Component)
 * POST /api/public-reports/generate
 */
export async function generatePublicReport(
  data: GeneratePublicReportRequest
): Promise<GeneratePublicReportResponse> {
  return apiClient<GeneratePublicReportResponse>('/api/public-reports/generate', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
}

/**
 * Revoca un token de acceso público (Client Component)
 * DELETE /api/public-reports/:token
 */
export async function revokePublicReport(token: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/api/public-reports/${token}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}

/**
 * Obtiene los datos del reporte público por token — NO requiere autenticación.
 * Usado desde Server Components de la ruta /public/[token].
 * Lanza un Error con el status HTTP como mensaje si falla (ej. "404", "500").
 * @param mes  Mes a consultar (1–12). Si se omite, el backend devuelve el mes actual.
 * @param año  Año a consultar (ej. 2026). Si se omite, el backend devuelve el año actual.
 * Cada ítem de `metrics_by_regimen` puede incluir `tax_estimate` (estimación informativa ISR/IVA).
 */
export async function getPublicReport(
  token: string,
  mes?: number,
  año?: number
): Promise<PublicReportResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const qs = new URLSearchParams();
  if (mes !== undefined) qs.set('mes', String(mes));
  if (año !== undefined) qs.set('año', String(año));
  const query = qs.toString() ? `?${qs.toString()}` : '';

  const response = await fetch(`${API_URL}/api/public-reports/${token}${query}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  return response.json() as Promise<PublicReportResponse>;
}
