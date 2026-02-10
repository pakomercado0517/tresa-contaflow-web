import { apiClient } from './client';
import type {
  GetManualIncomesResponse,
  GetManualIncomeResponse,
  CreateManualIncomeRequest,
  CreateManualIncomeResponse,
  UpdateManualIncomeRequest,
  UpdateManualIncomeResponse,
} from '@/lib/types/manual-incomes';

/**
 * Lista los ingresos manuales de un período (Client Component only)
 */
export async function getManualIncomesClient(
  periodId: string
): Promise<GetManualIncomesResponse> {
  const queryParams = new URLSearchParams({ period_id: periodId });
  return apiClient<GetManualIncomesResponse>(
    `/api/manual-incomes?${queryParams.toString()}`,
    { requireAuth: true }
  );
}

/**
 * Obtiene un ingreso manual por ID (Client Component only)
 */
export async function getManualIncomeByIdClient(
  id: string
): Promise<GetManualIncomeResponse> {
  return apiClient<GetManualIncomeResponse>(`/api/manual-incomes/${id}`, {
    requireAuth: true,
  });
}

/**
 * Crea un ingreso devengado manual (Client Component only)
 */
export async function createManualIncomeClient(
  body: CreateManualIncomeRequest
): Promise<CreateManualIncomeResponse> {
  return apiClient<CreateManualIncomeResponse>('/api/manual-incomes', {
    method: 'POST',
    body: JSON.stringify(body),
    requireAuth: true,
  });
}

/**
 * Actualiza un ingreso manual existente (Client Component only)
 */
export async function updateManualIncomeClient(
  id: string,
  body: UpdateManualIncomeRequest
): Promise<UpdateManualIncomeResponse> {
  return apiClient<UpdateManualIncomeResponse>(`/api/manual-incomes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    requireAuth: true,
  });
}

/**
 * Elimina un ingreso manual (Client Component only)
 */
export async function deleteManualIncomeClient(id: string): Promise<{ data: { id: string } }> {
  return apiClient<{ data: { id: string } }>(`/api/manual-incomes/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
