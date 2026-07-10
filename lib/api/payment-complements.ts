import { serverApiClient } from './server-client';
import type {
  ComplementRole,
  ListPaymentComplementsResponse,
} from '@/lib/types/payment-complements';

export interface ListPaymentComplementsParams {
  profile_id?: string;
  role: ComplementRole;
  mes?: number;
  año?: number;
  page?: number;
  limit?: number;
}

function buildPaymentComplementsQuery(params: ListPaymentComplementsParams): string {
  const queryParams = new URLSearchParams();
  queryParams.set('role', params.role);
  if (params.profile_id) queryParams.set('profile_id', params.profile_id);
  if (params.mes != null) queryParams.set('mes', String(params.mes));
  if (params.año != null) queryParams.set('año', String(params.año));
  if (params.page != null) queryParams.set('page', String(params.page));
  if (params.limit != null) queryParams.set('limit', String(params.limit));
  return queryParams.toString();
}

/**
 * Lista complementos de pago (Server Component only).
 */
export async function listPaymentComplements(
  params: ListPaymentComplementsParams
): Promise<ListPaymentComplementsResponse> {
  const queryString = buildPaymentComplementsQuery(params);
  return serverApiClient<ListPaymentComplementsResponse>(
    `/api/payment-complements?${queryString}`,
    { redirectOnAuthError: true }
  );
}
