import type { ReadonlyURLSearchParams } from 'next/navigation';

import type { Profile } from '@/lib/types/profiles';
import {
  clearStoredDashboardFiltersProfile,
  getStoredDashboardFilters,
  setStoredDashboardFilters,
  type DashboardFiltersPartial,
} from '@/lib/storage/dashboard-filters';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

export interface ResolvedDashboardListFilters {
  profileId: string | undefined;
  mes: number;
  año: number;
  regimen_fiscal: string | undefined;
  page: number;
  complementPage: number;
  search: string | undefined;
}

export interface ResolveDashboardListFiltersResult {
  filters: ResolvedDashboardListFilters;
  /** null si la URL ya refleja los filtros efectivos */
  canonicalSearch: string | null;
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

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function syncUrlFiltersToStorage(searchParams: ReadonlyURLSearchParams): void {
  const partial: DashboardFiltersPartial = {};
  const urlProfileId = searchParams.get('profileId');
  if (urlProfileId !== null && urlProfileId !== 'all') {
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

export function isStoredProfileRestorable(
  storedProfileId: string | undefined,
  profiles: Profile[]
): boolean {
  if (!storedProfileId || storedProfileId === 'all') return false;
  return profiles.some((profile) => profile.id === storedProfileId && !profile.frozen);
}

function getActiveProfiles(profiles: Profile[]): Profile[] {
  return profiles.filter((profile) => !profile.frozen);
}

/** Primer régimen del perfil cuando tiene 2+; undefined si no aplica filtro por régimen. */
export function getDefaultRegimenFiscalForProfile(
  profile: Profile | undefined
): string | undefined {
  const regimenes = profile?.regimenes_fiscales ?? [];
  return regimenes.length >= 2 ? regimenes[0] : undefined;
}

export function buildListFiltersSearchParams(
  filters: ResolvedDashboardListFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.profileId) {
    params.set('profileId', filters.profileId);
  }
  params.set('mes', String(filters.mes));
  params.set('año', String(filters.año));
  if (filters.regimen_fiscal) {
    params.set('regimen_fiscal', filters.regimen_fiscal);
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  params.set('page', String(filters.page));
  params.set('complementPage', String(filters.complementPage));
  return params;
}

function normalizeSearchForCompare(params: URLSearchParams): string {
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  return new URLSearchParams(entries).toString();
}

export function listFiltersQueryMatchesUrl(
  filters: ResolvedDashboardListFilters,
  searchParams: ReadonlyURLSearchParams
): boolean {
  const canonical = buildListFiltersSearchParams(filters);
  const current = new URLSearchParams(searchParams.toString());
  return normalizeSearchForCompare(canonical) === normalizeSearchForCompare(current);
}

/**
 * Calcula filtros efectivos (URL + localStorage + perfiles) sin navegar.
 */
export function resolveDashboardListFilters(
  searchParams: ReadonlyURLSearchParams,
  profiles: Profile[]
): ResolveDashboardListFiltersResult {
  syncUrlFiltersToStorage(searchParams);

  const { mes: appMes, año: appAño } = getCurrentMonthYearInAppTimezone();
  const stored = getStoredDashboardFilters();

  const urlMes = parseUrlMes(searchParams.get('mes'));
  const urlAño = parseUrlAño(searchParams.get('año'));
  const urlProfileId = searchParams.get('profileId');

  let didRestore = false;

  let profileId: string | undefined =
    urlProfileId && urlProfileId !== 'all' ? urlProfileId : undefined;

  if (urlProfileId === null && stored && profiles.length > 0) {
    if (isStoredProfileRestorable(stored.profileId, profiles)) {
      profileId = stored.profileId;
      didRestore = true;
    } else if (stored.profileId) {
      clearStoredDashboardFiltersProfile();
    }
  }

  if (!profileId && profiles.length > 0) {
    const activeProfiles = getActiveProfiles(profiles);
    if (activeProfiles.length === 1) {
      profileId = activeProfiles[0].id;
      didRestore = true;
    }
  }

  let mes = urlMes ?? stored?.mes ?? appMes;
  let año = urlAño ?? stored?.año ?? appAño;

  if (urlMes === null && stored) {
    mes = stored.mes;
    didRestore = true;
  }
  if (urlAño === null && stored) {
    año = stored.año;
    didRestore = true;
  }

  const regimenParam = searchParams.get('regimen_fiscal');
  let regimen_fiscal =
    regimenParam && regimenParam !== 'all' ? regimenParam : undefined;

  if (regimenParam === null && profileId) {
    const profile = profiles.find((item) => item.id === profileId);
    const defaultRegimen = getDefaultRegimenFiscalForProfile(profile);
    if (defaultRegimen) {
      regimen_fiscal = defaultRegimen;
      didRestore = true;
    }
  }
  const searchRaw = searchParams.get('search');
  const search = searchRaw && searchRaw.length > 0 ? searchRaw : undefined;

  const page = didRestore ? 1 : toPositiveInt(searchParams.get('page'), 1);
  const complementPage = didRestore ? 1 : toPositiveInt(searchParams.get('complementPage'), 1);

  const filters: ResolvedDashboardListFilters = {
    profileId,
    mes,
    año,
    regimen_fiscal,
    page,
    complementPage,
    search,
  };

  const canonical = buildListFiltersSearchParams(filters);
  const current = new URLSearchParams(searchParams.toString());

  const canonicalNorm = normalizeSearchForCompare(canonical);
  const currentNorm = normalizeSearchForCompare(current);

  return {
    filters,
    canonicalSearch: canonicalNorm === currentNorm ? null : canonical.toString(),
  };
}

/**
 * Indica si la URL del home ya refleja los filtros efectivos (sin exigir page/complementPage).
 */
export function dashboardHomeUrlReflectsFilters(
  searchParams: ReadonlyURLSearchParams,
  filters: ResolvedDashboardListFilters
): boolean {
  const { mes: appMes, año: appAño } = getCurrentMonthYearInAppTimezone();

  const urlProfileId = searchParams.get('profileId');
  const effectiveProfileId = filters.profileId ?? null;
  if ((urlProfileId || null) !== (effectiveProfileId || null)) {
    return false;
  }

  const urlMes = searchParams.get('mes');
  if (urlMes === null) {
    if (filters.mes !== appMes) return false;
  } else if (Number(urlMes) !== filters.mes) {
    return false;
  }

  const urlAño = searchParams.get('año');
  if (urlAño === null) {
    if (filters.año !== appAño) return false;
  } else if (Number(urlAño) !== filters.año) {
    return false;
  }

  const urlRegimen = searchParams.get('regimen_fiscal');
  const effectiveRegimen = filters.regimen_fiscal ?? null;
  if ((urlRegimen || null) !== (effectiveRegimen || null)) {
    return false;
  }

  const urlSearch = searchParams.get('search');
  if ((urlSearch || '') !== (filters.search || '')) {
    return false;
  }

  return true;
}

/**
 * Query para router.replace en /dashboard. null si no hace falta navegar.
 */
export function getDashboardHomeReplaceSearch(
  searchParams: ReadonlyURLSearchParams,
  profiles: Profile[]
): string | null {
  const resolved = resolveDashboardListFilters(searchParams, profiles);
  if (dashboardHomeUrlReflectsFilters(searchParams, resolved.filters)) {
    return null;
  }
  return buildListFiltersSearchParams(resolved.filters).toString();
}
