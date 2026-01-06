"use server";

import { redirect } from "next/navigation";
import { verifyEmail, resendVerificationEmail } from "@/lib/api/auth";
import type {
  VerifyEmailRequest,
  ResendVerificationEmailRequest,
} from "@/lib/types/auth";

export interface ActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  if (!token) {
    return { error: "Token de verificación requerido" };
  }

  try {
    const requestData: VerifyEmailRequest = { token };
    await verifyEmail(requestData);

    redirect("/auth/verify-email/success");
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
    return { error: "Error al verificar el email. Intenta nuevamente." };
  }
}

export async function resendVerificationEmailAction(
  email: string
): Promise<ActionResult> {
  if (!email) {
    return { error: "Email es requerido" };
  }

  try {
    const requestData: ResendVerificationEmailRequest = { email };
    const response = await resendVerificationEmail(requestData);

    return {
      success: true,
      message: response.message || "Email de verificación reenviado correctamente",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al reenviar el email. Intenta nuevamente." };
  }
}
