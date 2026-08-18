"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { logger } from "@/lib/utils/logger";
import { createProfile, updateProfile } from "@/lib/api/profiles";
import { getProfiles } from "@/lib/api/profiles";
import { getSubscription } from "@/lib/api/subscription";
import { logoutUser } from "@/lib/api/auth.server";
import { ServerApiError } from "@/lib/api/server-client";
import {
  canCreateProfile,
  getProfileLimit,
} from "@/lib/utils/subscription";
import type { CreateProfileRequest, UpdateProfileRequest } from "@/lib/types/profiles";
import { requireAuth } from "@/lib/auth/require-auth";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function createProfileAction(
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const nombre = formData.get("nombre") as string;
  const rfc = formData.get("rfc") as string;
  const tipoPersona = formData.get("tipo_persona") as "FISICA" | "MORAL";

  if (!nombre || !rfc || !tipoPersona) {
    return { error: "Todos los campos son requeridos" };
  }

  if (nombre.length < 2 || nombre.length > 255) {
    return { error: "El nombre debe tener entre 2 y 255 caracteres" };
  }

  if (rfc.length < 12 || rfc.length > 13) {
    return { error: "El RFC debe tener 12 o 13 caracteres" };
  }

  // Validación básica de formato RFC
  const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  if (!rfcPattern.test(rfc)) {
    return { error: "Formato de RFC inválido" };
  }

  if (tipoPersona !== "FISICA" && tipoPersona !== "MORAL") {
    return { error: "El tipo de persona debe ser FISICA o MORAL" };
  }

  const regimenesFiscales = formData.getAll("regimenes_fiscales");
  const regimenesFiscalesArray = Array.isArray(regimenesFiscales)
    ? (regimenesFiscales as string[]).filter((c): c is string => typeof c === "string")
    : [];

  try {
    // Verificar límites antes de crear
    const [subscription, profiles] = await Promise.all([
      getSubscription().catch(() => null),
      getProfiles().catch(() => null),
    ]);

    const currentProfileCount = profiles?.count || 0;
    const plan = subscription?.plan || "FREE";

    if (!canCreateProfile(currentProfileCount, plan, subscription)) {
      const limit = getProfileLimit(plan, subscription);
      const limitMessage =
        limit === Infinity
          ? "Has alcanzado el límite de tu plan actual."
          : `Has alcanzado el límite de ${limit} perfil${limit > 1 ? "es" : ""} de tu plan actual.`;
      return {
        error: `${limitMessage} Actualiza tu plan para crear más perfiles.`,
      };
    }

    const requestData: CreateProfileRequest = {
      nombre,
      rfc,
      tipo_persona: tipoPersona,
      regimenes_fiscales: regimenesFiscalesArray,
    };

    await createProfile(requestData);

    // Redirigir a la configuración después de crear el perfil
    redirect("/dashboard/setup");
  } catch (error) {
    // Manejar excepciones de redirect de Next.js
    if (error && typeof error === "object" && "digest" in error) {
      const nextError = error as { digest?: string };
      if (nextError.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }

    // Priorizar el mensaje del response del backend cuando viene en el body (ej. perfil ya existe con otro usuario)
    if (error instanceof ServerApiError && error.data && typeof error.data === "object" && "message" in error.data) {
      const apiMessage = (error.data as { message?: unknown }).message;
      if (typeof apiMessage === "string" && apiMessage.trim()) {
        return { error: apiMessage };
      }
    }

    if (error instanceof Error) {
      if (error.message.includes("Límite de perfiles")) {
        return { error: "Has alcanzado el límite de perfiles de tu plan" };
      }
      return { error: error.message };
    }

    return { error: "Error al crear el perfil. Intenta nuevamente." };
  }
}

export async function updateProfileAction(
  profileId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const nombre = formData.get("nombre") as string;
  const rfc = formData.get("rfc") as string;
  const tipoPersona = formData.get("tipo_persona") as "FISICA" | "MORAL";

  if (!profileId || !nombre || !rfc || !tipoPersona) {
    return { error: "Todos los campos son requeridos" };
  }

  if (nombre.length < 2 || nombre.length > 255) {
    return { error: "El nombre debe tener entre 2 y 255 caracteres" };
  }

  if (rfc.length < 12 || rfc.length > 13) {
    return { error: "El RFC debe tener 12 o 13 caracteres" };
  }

  const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  if (!rfcPattern.test(rfc)) {
    return { error: "Formato de RFC inválido" };
  }

  if (tipoPersona !== "FISICA" && tipoPersona !== "MORAL") {
    return { error: "El tipo de persona debe ser FISICA o MORAL" };
  }

  const regimenesFiscales = formData.getAll("regimenes_fiscales");
  const regimenesFiscalesArray = Array.isArray(regimenesFiscales)
    ? (regimenesFiscales as string[]).filter((c): c is string => typeof c === "string")
    : [];

  try {
    const requestData: UpdateProfileRequest = {
      nombre,
      rfc,
      tipo_persona: tipoPersona,
      regimenes_fiscales: regimenesFiscalesArray,
    };

    await updateProfile(profileId, requestData);

    redirect("/dashboard/setup/profiles");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      const nextError = error as { digest?: string };
      if (nextError.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }

    if (error instanceof ServerApiError && error.data && typeof error.data === "object" && "message" in error.data) {
      const apiMessage = (error.data as { message?: unknown }).message;
      if (typeof apiMessage === "string" && apiMessage.trim()) {
        return { error: apiMessage };
      }
    }

    if (error instanceof Error) {
      if (error.message.includes("Perfil no encontrado")) {
        return { error: "El perfil ya no existe o fue eliminado" };
      }
      return { error: error.message };
    }

    return { error: "Error al actualizar el perfil. Intenta nuevamente." };
  }
}

export async function logoutAction() {
  await requireAuth();

  try {
    await logoutUser();
  } catch (error) {
    // Continuar con el logout incluso si hay error en la API
    logger.error("Error al cerrar sesión", error);
  }

  // Complementar clear: Set-Cookie del API en fetch server-side no limpia el browser
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  redirect("/auth/login");
}

