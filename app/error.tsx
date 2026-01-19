"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to logger for debugging
    logger.error("Application error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2">
        <Image
          src="/logotipo-contaFlow.svg"
          alt="Conta Flow"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="text-xl font-semibold">Conta Flow</span>
      </Link>

      {/* Error Content */}
      <Card className="w-full max-w-md p-8 bg-card border-border shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Algo salió mal</h1>
            <p className="text-sm text-muted-foreground">
              Ocurrió un error inesperado. Por favor intenta nuevamente o regresa a la página anterior.
            </p>
            {process.env.NODE_ENV === "development" && error.message && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-xs font-mono text-destructive break-all">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={reset}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al dashboard
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-border w-full">
            <p className="text-xs text-muted-foreground">
              Si el problema persiste, por favor{" "}
              <Link href="/dashboard/setup?tab=account" className="text-primary hover:underline">
                contacta con soporte
              </Link>
              .
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
