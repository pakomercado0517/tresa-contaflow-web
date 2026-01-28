import { apiClient } from './client';
import type {
  UploadExpenseResponse,
  CreateExpenseRequest,
  CreateExpenseResponse,
  DeleteExpenseResponse,
  GetExpensesResponse,
} from '@/lib/types/expenses';

export interface GetExpensesClientParams {
  profileId?: string;
  mes?: number;
  año?: number;
  tipo?: string;
  categoria?: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Obtiene los gastos del usuario (Client Component only)
 */
export async function getExpensesClient(
  params?: GetExpensesClientParams
): Promise<GetExpensesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.profileId) queryParams.append('profileId', params.profileId);
  if (params?.mes) queryParams.append('mes', params.mes.toString());
  if (params?.año) queryParams.append('año', params.año.toString());
  if (params?.tipo) queryParams.append('tipo', params.tipo);
  if (params?.categoria) queryParams.append('categoria', params.categoria);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/expenses${queryString ? `?${queryString}` : ''}`;

  return apiClient<GetExpensesResponse>(endpoint, {
    requireAuth: true,
  });
}

/**
 * Sube un archivo XML de gasto al backend (Client Component only)
 * Nota: En realidad usa el mismo endpoint que invoices/upload
 * El sistema determina automáticamente si es factura o gasto basándose en el RFC
 */
export async function uploadExpense(file: File, profileId: string): Promise<UploadExpenseResponse> {
  const formData = new FormData();
  formData.append('xml', file);
  formData.append('profileId', profileId);

  return apiClient<UploadExpenseResponse>('/api/invoices/upload', {
    method: 'POST',
    body: formData,
    requireAuth: true,
  });
}

/**
 * Crea un gasto manual (Client Component only)
 */
export async function createManualExpense(
  data: CreateExpenseRequest
): Promise<CreateExpenseResponse> {
  return apiClient<CreateExpenseResponse>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
}

/**
 * Elimina un gasto por ID (Client Component only)
 */
export async function deleteExpense(expenseId: string): Promise<DeleteExpenseResponse> {
  return apiClient<DeleteExpenseResponse>(`/api/expenses/${expenseId}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
