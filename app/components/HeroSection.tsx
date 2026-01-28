"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(value));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleStartFree = () => {
    if (!isValidEmail) return;
    setIsLoading(true);
    router.push(`/auth/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:py-32 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex flex-1 flex-col gap-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 w-fit">
            <span className="text-sm font-medium text-primary">
              Evita errores fiscales antes de que el SAT los detecte
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Control fiscal sin estrés para{" "}
            <span className="text-primary">negocios y contadores</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
            Centraliza tus CFDI, detecta errores fiscales automáticamente y genera
            reportes claros para tomar mejores decisiones, sin Excel y sin caos.
            Gestiona múltiples RFCs desde un solo sistema.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-card px-4 py-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Ingresa tu correo profesional"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {isValidEmail && (
                <Check className="h-5 w-5 text-green-500" />
              )}
            </div>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 whitespace-nowrap disabled:opacity-50" 
              onClick={handleStartFree}
              disabled={!isValidEmail || isLoading}
            >
              {isLoading ? "Redirigiendo..." : "Empieza gratis"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            30 días gratis. Sin tarjeta. Sin compromisos.
          </p>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg rounded-lg border border-border bg-card p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>

            <div className="space-y-4">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    305.30%
                  </div>
                  <div className="h-32 w-full bg-primary/20 rounded flex items-end justify-center gap-2 p-4">
                    <div className="h-16 w-8 bg-primary rounded"></div>
                    <div className="h-24 w-8 bg-primary rounded"></div>
                    <div className="h-20 w-8 bg-primary rounded"></div>
                    <div className="h-28 w-8 bg-primary rounded"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    Validación fiscal completada
                  </div>
                  <div className="text-sm text-muted-foreground">
                    342 CFDI revisados automáticamente hoy
                  </div>
                </div>
                <div className="text-primary font-semibold">+12.5%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
