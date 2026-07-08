import { apiClient } from './client';
import type {
  ComplementRole,
  GetPaymentComplementResponse,
  ListPaymentComplementsResponse,
} from '@/lib/types/payment-complements';

export interface ListPaymentComplementsClientParams {
  profile_id?: string;
  role: ComplementRole;
  mes?: number;
  año?: number;
  page?: number;
  limit?: number;
}

function buildPaymentComplementsQuery(params: ListPaymentComplementsClientParams): string {
  const queryParams = new URLSearchParams();
  queryParams.set('role', params.role);
  if (params.profile_id) queryParams.set('profile_id', params.profile_id);
  if (params.mes != null) queryParams.set('mes', String(params.mes));
  if (params.año != null) queryParams.set('año', String(params.año));
  if (params.page != null) queryParams.set('page', String(params.page));
  if (params.limit != null) queryParams.set('limit', String(params.limit));
  return queryParams.toString();
}

export function profileIdToSnakeQuery(profileIdFromUrl: string | undefined): string | undefined {
  if (!profileIdFromUrl || profileIdFromUrl === 'all') return undefined;
  return profileIdFromUrl;
}

export async function listPaymentComplementsClient(
  params: ListPaymentComplementsClientParams
): Promise<ListPaymentComplementsResponse> {
  const queryString = buildPaymentComplementsQuery(params);
  return apiClient<ListPaymentComplementsResponse>(`/api/payment-complements?${queryString}`, {
    requireAuth: true,
  });
}

export async function getPaymentComplementByIdClient(
  id: string,
  profile_id?: string
): Promise<GetPaymentComplementResponse> {
  const queryParams = new URLSearchParams();
  if (profile_id) queryParams.set('profile_id', profile_id);
  const queryString = queryParams.toString();
  const endpoint = `/api/payment-complements/${id}${queryString ? `?${queryString}` : ''}`;
  return apiClient<GetPaymentComplementResponse>(endpoint, { requireAuth: true });
}
