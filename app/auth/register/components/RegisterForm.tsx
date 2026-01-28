'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { UserPlus, Mail, Lock, ArrowRight, Loader2, User, Phone } from 'lucide-react';
import { registerAction } from '../actions';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // Derivar el email directamente de searchParams sin estado
  const emailFromQuery = searchParams.get('email') || '';

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="bg-card border-border w-full max-w-md p-8 shadow-lg">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
          <UserPlus className="text-primary h-8 w-8" />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <p className="text-muted-foreground text-sm">
            Empieza a gestionar tus RFCs de forma segura
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border-destructive/20 w-full rounded-md border p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="w-full space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">
                Nombre
              </Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Juan"
                  disabled={isPending}
                  className="bg-background pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido" className="text-foreground">
                Apellido
              </Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="apellido"
                  name="apellido"
                  type="text"
                  placeholder="Pérez"
                  disabled={isPending}
                  className="bg-background pl-10"
                />
              </div>
            </div>
          </div>

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
                defaultValue={emailFromQuery}
                className="bg-background pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-foreground">
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="+52 55 1234 5678"
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
                minLength={8}
                disabled={isPending}
                className="bg-background pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                className="bg-background pl-10"
              />
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
                Creando cuenta...
              </>
            ) : (
              <>
                Crear cuenta
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
              <div className="bg-card px-3">
                <div className="bg-foreground/40 h-2 w-2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          <span>¿Ya tienes una cuenta? </span>
          <Link href="/auth/login" className="text-foreground font-semibold hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>
    </Card>
  );
}
