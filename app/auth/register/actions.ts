"use server";

import { redirect } from "next/navigation";
import { registerUser } from "@/lib/api/auth";
import type { RegisterRequest } from "@/lib/types/auth";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function registerAction(
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  try {
    const requestData: RegisterRequest = { email, password };
    await registerUser(requestData);

    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      const nextError = error as { digest?: string };
      if (nextError.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }

    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al registrar usuario. Intenta nuevamente." };
  }
}

