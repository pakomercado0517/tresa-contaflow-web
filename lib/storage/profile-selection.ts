"use client";

const PROFILE_SELECTION_STORAGE_PREFIX = "contafy:profile-selection";
const GLOBAL_SCOPE_KEY = "global";

function getStorageKey(userId?: string): string {
  const normalizedUserId = userId?.trim() || GLOBAL_SCOPE_KEY;
  return `${PROFILE_SELECTION_STORAGE_PREFIX}:${normalizedUserId}`;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeProfileId(profileId: string): string {
  const value = profileId.trim();
  return value.length > 0 ? value : "all";
}

export function getStoredProfileSelection(userId?: string): string | null {
  if (!canUseStorage()) return null;

  const scopedValue = window.localStorage.getItem(getStorageKey(userId));
  if (scopedValue) return normalizeProfileId(scopedValue);

  if (userId) {
    const globalValue = window.localStorage.getItem(getStorageKey());
    return globalValue ? normalizeProfileId(globalValue) : null;
  }

  return null;
}

export function setStoredProfileSelection(profileId: string, userId?: string): void {
  if (!canUseStorage()) return;

  window.localStorage.setItem(getStorageKey(userId), normalizeProfileId(profileId));
}

export function clearStoredProfileSelection(userId?: string): void {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(getStorageKey(userId));
  if (userId) {
    window.localStorage.removeItem(getStorageKey());
  }
}

export function clearAllStoredProfileSelections(): void {
  if (!canUseStorage()) return;

  const keysToDelete: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(PROFILE_SELECTION_STORAGE_PREFIX)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => window.localStorage.removeItem(key));
}
