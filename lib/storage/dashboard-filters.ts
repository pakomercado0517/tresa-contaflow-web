'use client';

import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

const DASHBOARD_FILTERS_STORAGE_PREFIX = 'contafy:dashboard-filters';
const LEGACY_PROFILE_SELECTION_PREFIX = 'contafy:profile-selection';
const GLOBAL_SCOPE_KEY = 'global';

/** Valor legado en localStorage; ya no se persiste como selección activa. */
const LEGACY_ALL_PROFILES_VALUE = 'all';

export interface DashboardFiltersSelection {
  profileId?: string;
  mes: number;
  año: number;
}

export interface DashboardFiltersPartial {
  profileId?: string;
  mes?: number;
  año?: number;
}

function getStorageKey(userId?: string): string {
  const normalizedUserId = userId?.trim() || GLOBAL_SCOPE_KEY;
  return `${DASHBOARD_FILTERS_STORAGE_PREFIX}:${normalizedUserId}`;
}

function getLegacyProfileStorageKey(userId?: string): string {
  const normalizedUserId = userId?.trim() || GLOBAL_SCOPE_KEY;
  return `${LEGACY_PROFILE_SELECTION_PREFIX}:${normalizedUserId}`;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function parseStoredProfileId(profileId: string | undefined): string | undefined {
  if (!profileId || profileId === LEGACY_ALL_PROFILES_VALUE) {
    return undefined;
  }
  const value = profileId.trim();
  return value.length > 0 ? value : undefined;
}

function isValidMes(mes: number): boolean {
  return Number.isInteger(mes) && mes >= 1 && mes <= 12;
}

function isValidAño(año: number): boolean {
  return Number.isInteger(año) && año > 0;
}

function getDefaultFilters(): DashboardFiltersSelection {
  const { mes, año } = getCurrentMonthYearInAppTimezone();
  return { mes, año };
}

function parseStoredJson(raw: string): DashboardFiltersSelection | null {
  try {
    const parsed = JSON.parse(raw) as Partial<DashboardFiltersSelection>;
    if (typeof parsed !== 'object' || parsed === null) return null;

    const profileId =
      typeof parsed.profileId === 'string'
        ? parseStoredProfileId(parsed.profileId)
        : undefined;
    const mes = typeof parsed.mes === 'number' ? parsed.mes : NaN;
    const año = typeof parsed.año === 'number' ? parsed.año : NaN;

    if (!isValidMes(mes) || !isValidAño(año)) return null;

    return profileId ? { profileId, mes, año } : { mes, año };
  } catch {
    return null;
  }
}

function readRawFromStorage(userId?: string): string | null {
  const scoped = window.localStorage.getItem(getStorageKey(userId));
  if (scoped) return scoped;

  if (userId) {
    return window.localStorage.getItem(getStorageKey());
  }

  return null;
}

function migrateFromLegacyProfileSelection(userId?: string): DashboardFiltersSelection | null {
  const legacyKey = getLegacyProfileStorageKey(userId);
  let legacyValue = window.localStorage.getItem(legacyKey);

  if (!legacyValue && userId) {
    legacyValue = window.localStorage.getItem(getLegacyProfileStorageKey());
  }

  if (!legacyValue) return null;

  const defaults = getDefaultFilters();
  const profileId = parseStoredProfileId(legacyValue);
  const migrated: DashboardFiltersSelection = profileId
    ? { ...defaults, profileId }
    : defaults;

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(migrated));
  window.localStorage.removeItem(legacyKey);
  if (userId) {
    window.localStorage.removeItem(getLegacyProfileStorageKey());
  }

  return migrated;
}

export function getStoredDashboardFilters(userId?: string): DashboardFiltersSelection | null {
  if (!canUseStorage()) return null;

  const raw = readRawFromStorage(userId);
  if (raw) {
    const parsed = parseStoredJson(raw);
    if (parsed) return parsed;
    window.localStorage.removeItem(getStorageKey(userId));
  }

  return migrateFromLegacyProfileSelection(userId);
}

export function setStoredDashboardFilters(
  partial: DashboardFiltersPartial,
  userId?: string
): void {
  if (!canUseStorage()) return;

  const current = getStoredDashboardFilters(userId) ?? getDefaultFilters();

  const next: DashboardFiltersSelection = {
    mes:
      partial.mes !== undefined && isValidMes(partial.mes) ? partial.mes : current.mes,
    año:
      partial.año !== undefined && isValidAño(partial.año) ? partial.año : current.año,
  };

  if (partial.profileId !== undefined) {
    const profileId = parseStoredProfileId(partial.profileId);
    if (profileId) {
      next.profileId = profileId;
    }
  } else if (current.profileId) {
    next.profileId = current.profileId;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
}

export function clearStoredDashboardFiltersProfile(userId?: string): void {
  if (!canUseStorage()) return;

  const current = getStoredDashboardFilters(userId);
  if (!current) return;

  const { mes, año } = current;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify({ mes, año }));
}

export function clearAllStoredDashboardFilters(): void {
  if (!canUseStorage()) return;

  const keysToDelete: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (
      key &&
      (key.startsWith(DASHBOARD_FILTERS_STORAGE_PREFIX) ||
        key.startsWith(LEGACY_PROFILE_SELECTION_PREFIX))
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => window.localStorage.removeItem(key));
}
