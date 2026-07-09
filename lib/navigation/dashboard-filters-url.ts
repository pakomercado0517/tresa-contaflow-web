import type { ReadonlyURLSearchParams } from 'next/navigation';

import type { Profile } from '@/lib/types/profiles';
import {
  clearStoredDashboardFiltersProfile,
  getStoredDashboardFilters,
  setStoredDashboardFilters,
  type DashboardFiltersPartial,
} from '@/lib/storage/dashboard-filters';

interface TryRestoreDashboardFiltersInUrlOptions {
  searchParams: ReadonlyURLSearchParams;
  profiles: Profile[];
  router: { replace: (href: string) => void };
  pathname: string;
}

function isValidMes(mes: number): boolean {
  return Number.isInteger(mes) && mes >= 1 && mes <= 12;
}

function isValidAño(año: number): boolean {
  return Number.isInteger(año) && año > 0;
}

function parseUrlMes(value: string | null): number | null {
  if (value === null || value === '') return null;
  const mes = Number(value);
  return isValidMes(mes) ? mes : null;
}

function parseUrlAño(value: string | null): number | null {
  if (value === null || value === '') return null;
  const año = Number(value);
  return isValidAño(año) ? año : null;
}

function syncUrlFiltersToStorage(searchParams: ReadonlyURLSearchParams): void {
  const partial: DashboardFiltersPartial = {};
  const urlProfileId = searchParams.get('profileId');
  if (urlProfileId !== null) {
    partial.profileId = urlProfileId;
  }
  const urlMes = parseUrlMes(searchParams.get('mes'));
  if (urlMes !== null) {
    partial.mes = urlMes;
  }
  const urlAño = parseUrlAño(searchParams.get('año'));
  if (urlAño !== null) {
    partial.año = urlAño;
  }
  if (Object.keys(partial).length > 0) {
    setStoredDashboardFilters(partial);
  }
}

function isStoredProfileRestorable(storedProfileId: string, profiles: Profile[]): boolean {
  if (storedProfileId === 'all') return false;
  return profiles.some((profile) => profile.id === storedProfileId && !profile.frozen);
}

/**
 * Sincroniza profileId, mes y año en la URL con localStorage (sin useEffect).
 * Devuelve true si se inició una navegación replace.
 */
export function tryRestoreDashboardFiltersInUrl({
  searchParams,
  profiles,
  router,
  pathname,
}: TryRestoreDashboardFiltersInUrlOptions): boolean {
  syncUrlFiltersToStorage(searchParams);

  const stored = getStoredDashboardFilters();
  if (!stored) return false;

  const params = new URLSearchParams(searchParams.toString());
  let didRestore = false;

  const urlProfileId = searchParams.get('profileId');
  if (urlProfileId === null) {
    if (profiles.length > 0) {
      if (isStoredProfileRestorable(stored.profileId, profiles)) {
        params.set('profileId', stored.profileId);
        didRestore = true;
      } else if (stored.profileId !== 'all') {
        clearStoredDashboardFiltersProfile();
      }
    }
  }

  const urlMes = parseUrlMes(searchParams.get('mes'));
  if (urlMes === null) {
    params.set('mes', String(stored.mes));
    didRestore = true;
  }

  const urlAño = parseUrlAño(searchParams.get('año'));
  if (urlAño === null) {
    params.set('año', String(stored.año));
    didRestore = true;
  }

  if (!didRestore) return false;

  params.set('page', '1');
  router.replace(`${pathname}?${params.toString()}`);
  return true;
}
