'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { loginAction } from '../actions';
import { GoogleLoginButton } from './GoogleLoginButton';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const resetParam = searchParams.get('reset');
  const successMessage =
    resetParam === 'success'
      ? 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.'
      : null;

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="bg-card border-border w-full max-w-md p-8 shadow-lg">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
          <Lock className="text-primary h-8 w-8" />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <p className="text-muted-foreground text-sm">Gestiona tus RFCs de forma segura</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border-destructive/20 w-full rounded-md border p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="w-full rounded-md border border-green-500/20 bg-green-500/10 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          </div>
        )}

        <form action={handleSubmit} className="w-full space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                disabled={isPending}
                className="bg-background pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                className="bg-background pl-10"
              />
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-primary text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                Ingresar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="w-full">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="border-border w-full border-t"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card text-muted-foreground px-3 text-xs">o</span>
            </div>
          </div>
          <div className="mt-4">
            <GoogleLoginButton />
          </div>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          <span>¿Eres nuevo en Contafy? </span>
          <Link href="/auth/register" className="text-foreground font-semibold hover:underline">
            Crea una cuenta gratis
          </Link>
        </div>
      </div>
    </Card>
  );
}
