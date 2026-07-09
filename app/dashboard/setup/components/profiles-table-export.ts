import { apiClient } from '@/lib/api/client';
import type { Profile } from '@/lib/types/profiles';
import type { Invoice } from '@/lib/types/invoices';
import type { Expense } from '@/lib/types/expenses';
import type { ProfileStats } from '@/lib/utils/pdf-export';
import { calculateProfileStats } from './profiles-table-utils';

interface ProfilesExportPayload {
  profilesStats: ProfileStats[];
}

export async function fetchProfilesExportPayload(profiles: Profile[]): Promise<ProfilesExportPayload> {
  const [invoicesResponse, expensesResponse] = await Promise.all([
    apiClient<{ data: Invoice[] }>('/api/invoices?limit=10000', {
      requireAuth: true,
    }),
    apiClient<{ data: Expense[] }>('/api/expenses?limit=10000', {
      requireAuth: true,
    }),
  ]);

  const invoices = invoicesResponse.data || [];
  const expenses = expensesResponse.data || [];
  const profilesStats: ProfileStats[] = profiles.map((profile) =>
    calculateProfileStats(invoices, expenses, profile.id)
  );

  return { profilesStats };
}
