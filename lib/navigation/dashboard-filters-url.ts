import type { ReadonlyURLSearchParams } from 'next/navigation';

import type { Profile } from '@/lib/types/profiles';
import {
  getDashboardHomeReplaceSearch,
  resolveDashboardListFilters,
} from '@/lib/navigation/resolve-dashboard-list-filters';

interface TryRestoreDashboardFiltersInUrlOptions {
  searchParams: ReadonlyURLSearchParams;
  profiles: Profile[];
  router: { replace: (href: string) => void };
  pathname: string;
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
  const { canonicalSearch } = resolveDashboardListFilters(searchParams, profiles);
  if (!canonicalSearch) return false;

  router.replace(`${pathname}?${canonicalSearch}`);
  return true;
}

/**
 * Igual que tryRestoreDashboardFiltersInUrl, pero con la query del home
 * (no exige page/complementPage).
 */
export function tryRestoreDashboardHomeFiltersInUrl({
  searchParams,
  profiles,
  router,
  pathname,
}: TryRestoreDashboardFiltersInUrlOptions): boolean {
  const replaceSearch = getDashboardHomeReplaceSearch(searchParams, profiles);
  if (!replaceSearch) return false;

  router.replace(`${pathname}?${replaceSearch}`);
  return true;
}
