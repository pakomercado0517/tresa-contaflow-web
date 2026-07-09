import { logoutAction } from '@/app/dashboard/setup/actions';
import { clearAllStoredProfileSelections } from '@/lib/storage/profile-selection';

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
      clearAllStoredProfileSelections();
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
