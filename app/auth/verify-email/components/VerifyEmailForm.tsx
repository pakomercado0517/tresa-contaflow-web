"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Check, Info, Loader2 } from "lucide-react";
import { resendVerificationEmailAction } from "../actions";

interface VerifyEmailFormProps {
  email?: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleResend() {
    if (!email) {
      setError("No se encontró el email. Por favor, regístrate nuevamente.");
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await resendVerificationEmailAction(email);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.message || "Email reenviado correctamente");
      }
    });
  }

  return (
    <Card className="w-full max-w-md p-8 bg-card border-border shadow-lg">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-card border-2 border-primary flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center relative">
              <Mail className="h-8 w-8 text-primary" />
              <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Verifique su correo</h1>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Hemos enviado un enlace de confirmación a
            </p>
            {email && (
              <p className="text-sm font-medium text-foreground">{email}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="w-full p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="w-full p-3 bg-primary/10 border border-primary/20 rounded-md">
            <p className="text-sm text-primary">{success}</p>
          </div>
        )}

        <div className="w-full p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="h-3 w-3 text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Haga clic en el enlace del correo para activar su cuenta. Si no lo
              ve, revise su carpeta de spam o correo no deseado.
            </p>
          </div>
        </div>

        {email && (
          <Button
            onClick={handleResend}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                Reenviar Email
                <Mail className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}

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
          <span>¿Ya verificaste tu cuenta? </span>
          <Link
            href="/auth/login"
            className="font-semibold text-foreground hover:underline"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </Card>
  );
}

