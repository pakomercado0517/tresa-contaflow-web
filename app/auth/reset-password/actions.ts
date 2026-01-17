"use server";

import { redirect } from "next/navigation";
import type { ResetPasswordResponse } from "@/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { error: "Token de recuperación requerido" };
  }

  if (!password || !confirmPassword) {
    return { error: "Contraseña y confirmación son requeridas" };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  try {
    const backendResponse = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const response = (await backendResponse.json()) as ResetPasswordResponse;

    if (!backendResponse.ok) {
      const errorData = response as unknown as { error?: string; message?: string };
      // La API puede retornar 400 con diferentes mensajes:
      // - "Token inválido" / "El token proporcionado no es válido o ha expirado."
      // - "El token ha expirado" / "El token de restablecimiento ha expirado. Por favor solicita uno nuevo."
      // - "Contraseña inválida" / "La contraseña debe tener al menos 8 caracteres"
      // O 500 para errores del servidor
      return {
        error: errorData.message || errorData.error || "Error al restablecer la contraseña",
      };
    }

    // Redirigir a login después de éxito
    redirect("/auth/login?reset=success");
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
    return { error: "Error al restablecer la contraseña. Intenta nuevamente." };
  }
}
