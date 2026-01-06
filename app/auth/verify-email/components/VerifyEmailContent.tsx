"use client";

import { useEffect, useState, useTransition } from "react";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { verifyEmailAction } from "../actions";
import { Loader2 } from "lucide-react";

interface VerifyEmailContentProps {
  token?: string;
  email?: string;
}

export function VerifyEmailContent({
  token,
  email,
}: VerifyEmailContentProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (token) {
      setIsVerifying(true);
      startTransition(async () => {
        const result = await verifyEmailAction(token);
        if (result.error) {
          setError(result.error);
          setIsVerifying(false);
        }
      });
    }
  }, [token]);

  if (isVerifying || isPending) {
    return (
      <div className="w-full max-w-md p-8 bg-card border-border shadow-lg rounded-lg flex flex-col items-center gap-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Verificando email...</h1>
          <p className="text-sm text-muted-foreground">
            Por favor espera mientras verificamos tu cuenta
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md p-8 bg-card border-border shadow-lg rounded-lg">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">
              Error de verificación
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <VerifyEmailForm email={email} />
        </div>
      </div>
    );
  }

  return <VerifyEmailForm email={email} />;
}

