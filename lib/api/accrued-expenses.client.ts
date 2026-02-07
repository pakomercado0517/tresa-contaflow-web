import { apiClient } from './client';
import type {
  GetAccruedExpensesResponse,
  CreateAccruedExpenseRequest,
  CreateAccruedExpenseResponse,
  UpdateAccruedExpenseRequest,
  UpdateAccruedExpenseResponse,
  DeleteAccruedExpenseResponse,
} from '@/lib/types/expenses';

/**
 * Lista los gastos devengados manuales de un período (Client Component only)
 * GET /api/accrued-expenses?period_id=xxx&type=manual
 */
export async function getAccruedExpensesClient(
  periodId: string
): Promise<GetAccruedExpensesResponse> {
  const queryParams = new URLSearchParams({
    period_id: periodId,
    type: 'manual',
  });
  return apiClient<GetAccruedExpensesResponse>(
    `/api/accrued-expenses?${queryParams.toString()}`,
    { requireAuth: true }
  );
}

/**
 * Crea un gasto devengado manual (Client Component only)
 * POST /api/accrued-expenses
 */
export async function createAccruedExpenseClient(
  body: CreateAccruedExpenseRequest
): Promise<CreateAccruedExpenseResponse> {
  return apiClient<CreateAccruedExpenseResponse>('/api/accrued-expenses', {
    method: 'POST',
    body: JSON.stringify(body),
    requireAuth: true,
  });
}

/**
 * Actualiza un gasto devengado manual (Client Component only)
 * PUT /api/accrued-expenses/:id
 */
export async function updateAccruedExpenseClient(
  id: string,
  body: UpdateAccruedExpenseRequest
): Promise<UpdateAccruedExpenseResponse> {
  return apiClient<UpdateAccruedExpenseResponse>(`/api/accrued-expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    requireAuth: true,
  });
}

/**
 * Elimina un gasto devengado manual (Client Component only)
 * DELETE /api/accrued-expenses/:id
 */
export async function deleteAccruedExpenseClient(
  id: string
): Promise<DeleteAccruedExpenseResponse> {
  return apiClient<DeleteAccruedExpenseResponse>(`/api/accrued-expenses/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
