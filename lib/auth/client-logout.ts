import { logoutAction } from '@/app/dashboard/setup/actions';
import { clearAllStoredDashboardFilters } from '@/lib/storage/dashboard-filters';

interface PerformClientLogoutOptions {
  clearProfileSelections?: boolean;
}

export async function performClientLogout(
  options: PerformClientLogoutOptions = {}
): Promise<void> {
  const { clearProfileSelections = true } = options;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('tour:onboarding');
    if (clearProfileSelections) {
      clearAllStoredDashboardFilters();
    }
  }

  await logoutAction();
}

export function startClientLogout(): void {
  void performClientLogout();
}

export function startDiscountAdminLogout(): void {
  void performClientLogout({ clearProfileSelections: false });
}
