"use server";

import { redirect } from "next/navigation";
import type { RegisterResponse } from "@/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
    // Hacer fetch directo al backend sin usar apiClient
    // (apiClient está diseñado para client components, no server actions)
    const backendResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const response = (await backendResponse.json()) as RegisterResponse;

    if (!backendResponse.ok) {
      const errorData = response as unknown as { error?: string; message?: string };
      return {
        error: errorData.error || errorData.message || "Error al registrar usuario",
      };
    }

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

