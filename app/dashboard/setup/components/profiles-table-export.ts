import { getAllInvoicesClient } from '@/lib/api/invoices.client';
import { getAllExpensesClient } from '@/lib/api/expenses.client';
import type { Profile } from '@/lib/types/profiles';
import type { ProfileStats } from '@/lib/utils/pdf-export';
import { calculateProfileStats } from './profiles-table-utils';

interface ProfilesExportPayload {
  profilesStats: ProfileStats[];
}

export async function fetchProfilesExportPayload(profiles: Profile[]): Promise<ProfilesExportPayload> {
  const [invoices, expenses] = await Promise.all([
    getAllInvoicesClient(),
    getAllExpensesClient(),
  ]);

  const profilesStats: ProfileStats[] = profiles.map((profile) =>
    calculateProfileStats(invoices, expenses, profile.id)
  );

  return { profilesStats };
}
