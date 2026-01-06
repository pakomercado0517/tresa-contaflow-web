"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { loginUser } from "@/lib/api/auth";
import type { LoginRequest } from "@/lib/types/auth";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" };
  }

  try {
    const requestData: LoginRequest = { email, password };
    const response = await loginUser(requestData);

    const cookieStore = await cookies();
    
    cookieStore.set("accessToken", response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
    });

    cookieStore.set("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (!response.user.email_verified) {
      redirect("/auth/verify-email");
    }

    redirect("/dashboard");
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
    return { error: "Error al iniciar sesión. Intenta nuevamente." };
  }
}

