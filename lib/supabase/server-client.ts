import "server-only";

import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/rest\/v1\/?$/i, "");
}

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error("Falta SUPABASE_URL en las variables de entorno.");
  }
  const normalized = normalizeSupabaseUrl(url);
  if (!normalized.endsWith(".supabase.co")) {
    throw new Error(
      "SUPABASE_URL debe ser la URL del proyecto (https://<ref>.supabase.co), sin /rest/v1."
    );
  }
  return normalized;
}

function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.");
  }
  return key;
}

export function getSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseProjectUrl(): string {
  return getSupabaseUrl();
}
