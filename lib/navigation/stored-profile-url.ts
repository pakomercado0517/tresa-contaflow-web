import type { ReadonlyURLSearchParams } from 'next/navigation';

import type { Profile } from '@/lib/types/profiles';
import {
  clearStoredProfileSelection,
  getStoredProfileSelection,
  setStoredProfileSelection,
} from '@/lib/storage/profile-selection';

interface TryRestoreStoredProfileInUrlOptions {
  searchParams: ReadonlyURLSearchParams;
  profiles: Profile[];
  router: { replace: (href: string) => void };
  pathname: string;
}

/**
 * Sincroniza profileId en la URL con localStorage (sin useEffect).
 * Devuelve true si se inició una navegación replace.
 */
export function tryRestoreStoredProfileInUrl({
  searchParams,
  profiles,
  router,
  pathname,
}: TryRestoreStoredProfileInUrlOptions): boolean {
  const urlProfileId = searchParams.get('profileId');
  if (urlProfileId) {
    setStoredProfileSelection(urlProfileId);
    return false;
  }

  const storedProfileId = getStoredProfileSelection();
  if (!storedProfileId || storedProfileId === 'all') return false;
  if (profiles.length === 0) return false;

  const storedProfileExists = profiles.some(
    (profile) => profile.id === storedProfileId && !profile.frozen
  );
  if (!storedProfileExists) {
    clearStoredProfileSelection();
    return false;
  }

  const params = new URLSearchParams(searchParams.toString());
  params.set('profileId', storedProfileId);
  params.set('page', '1');
  router.replace(`${pathname}?${params.toString()}`);
  return true;
}
