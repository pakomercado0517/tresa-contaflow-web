"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { UserPlus, Mail, Lock, ArrowRight, Loader2, User, Phone } from "lucide-react";
import { registerAction } from "../actions";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [emailFromQuery, setEmailFromQuery] = useState("");

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setEmailFromQuery(email);
    }
  }, [searchParams]);

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
    <Card className="w-full max-w-md p-8 bg-card border-border shadow-lg">
      <div className="flex flex-col items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Empieza a gestionar tus RFCs de forma segura
          </p>
        </div>

        {error && (
          <div className="w-full p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="w-full space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">
                Nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Juan"
                  disabled={isPending}
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido" className="text-foreground">
                Apellido
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="apellido"
                  name="apellido"
                  type="text"
                  placeholder="Pérez"
                  disabled={isPending}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                disabled={isPending}
                defaultValue={emailFromQuery}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-foreground">
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="+52 55 1234 5678"
                disabled={isPending}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isPending}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
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
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-card px-3">
                <div className="h-2 w-2 rounded-full bg-foreground/40"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <span>¿Ya tienes una cuenta? </span>
          <Link
            href="/auth/login"
            className="font-semibold text-foreground hover:underline"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </Card>
  );
}
