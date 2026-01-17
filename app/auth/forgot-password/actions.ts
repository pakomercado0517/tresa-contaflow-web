"use server";

import type { ForgotPasswordResponse } from "@/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function forgotPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email es requerido" };
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Email inválido" };
  }

  try {
    const backendResponse = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const response = (await backendResponse.json()) as ForgotPasswordResponse;

    if (!backendResponse.ok) {
      const errorData = response as unknown as { error?: string; message?: string };
      // La API puede retornar 400 (email inválido) o 500 (error del servidor)
      return {
        error: errorData.message || errorData.error || "Error al enviar el email de recuperación",
      };
    }

    // La API siempre retorna éxito con el mismo mensaje por seguridad
    // (independientemente de si el email existe o no)
    return {
      success: true,
      message: response.message || "Si el email está registrado, se enviará un correo con las instrucciones para restablecer tu contraseña.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al enviar el email de recuperación. Intenta nuevamente." };
  }
}
