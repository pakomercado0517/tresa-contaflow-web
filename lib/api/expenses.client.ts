import { apiClient } from './client';
import { fetchAllPages } from './fetch-all-pages';
import type {
  UploadExpenseResponse,
  DeleteExpenseResponse,
  GetExpensesResponse,
  Expense,
} from '@/lib/types/expenses';

export interface GetExpensesClientParams {
  profileId?: string;
  mes?: number;
  año?: number;
  tipo?: string;
  regimen_fiscal?: string;
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
  if (params?.regimen_fiscal) queryParams.append('regimen_fiscal', params.regimen_fiscal);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/expenses${queryString ? `?${queryString}` : ''}`;

  return apiClient<GetExpensesResponse>(endpoint, {
    requireAuth: true,
  });
}

export async function getAllExpensesClient(
  params?: Omit<GetExpensesClientParams, 'page' | 'limit'>
): Promise<Expense[]> {
  return fetchAllPages((page, limit) => getExpensesClient({ ...params, page, limit }));
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
 * Elimina un gasto por ID (Client Component only)
 */
export async function deleteExpense(expenseId: string): Promise<DeleteExpenseResponse> {
  return apiClient<DeleteExpenseResponse>(`/api/expenses/${expenseId}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
