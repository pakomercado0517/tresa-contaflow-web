import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token no encontrado" },
        { status: 401 }
      );
    }

    // Llamar al endpoint de refresh del backend
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el refresh token expiró, limpiar cookies y redirigir
      if (response.status === 401) {
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
        return NextResponse.json(
          { error: "Refresh token expirado", redirect: true },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: data.error || "Error al refrescar token" },
        { status: response.status }
      );
    }

    // Actualizar el access token en las cookies
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutos
    });

    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    logger.error("Error en refresh route", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

