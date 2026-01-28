'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { LoginResponse } from '@/lib/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' };
  }

  try {
    // Hacer fetch directo al backend sin usar apiClient
    // (apiClient está diseñado para client components, no server actions)
    const backendResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const response = (await backendResponse.json()) as LoginResponse;

    if (!backendResponse.ok) {
      const errorData = response as unknown as { error?: string; message?: string };
      return {
        error: errorData.error || errorData.message || 'Error al iniciar sesión',
      };
    }

    const cookieStore = await cookies();

    cookieStore.set('accessToken', response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
    });

    cookieStore.set('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    if (!response.user.email_verified) {
      redirect('/auth/verify-email');
    }

    // Limpiar caché del dashboard para datos frescos
    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) {
      const nextError = error as { digest?: string };
      if (nextError.digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
    }

    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Error al iniciar sesión. Intenta nuevamente.' };
  }
}
