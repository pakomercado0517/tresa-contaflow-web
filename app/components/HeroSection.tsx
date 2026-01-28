'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();
  const [email, setEmail] = useState('');
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
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8 lg:py-32">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex flex-1 flex-col gap-6">
          <div className="bg-primary/10 inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5">
            <span className="text-primary text-sm font-medium">
              Evita errores fiscales antes de que el SAT los detecte
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Control fiscal sin estrés para{' '}
            <span className="text-primary">negocios y contadores</span>
          </h1>

          <p className="text-muted-foreground max-w-xl text-lg">
            Centraliza tus CFDI, detecta errores fiscales automáticamente y genera reportes claros
            para tomar mejores decisiones, sin Excel y sin caos. Gestiona múltiples RFCs desde un
            solo sistema.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="border-input bg-card flex flex-1 items-center gap-2 rounded-lg border px-4 py-2">
              <Mail className="text-muted-foreground h-5 w-5" />
              <Input
                type="email"
                placeholder="Ingresa tu correo profesional"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {isValidEmail && <Check className="h-5 w-5 text-green-500" />}
            </div>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 whitespace-nowrap disabled:opacity-50"
              onClick={handleStartFree}
              disabled={!isValidEmail || isLoading}
            >
              {isLoading ? 'Redirigiendo...' : 'Empieza gratis'}
            </Button>
          </div>

          <p className="text-muted-foreground text-sm">
            30 días gratis. Sin tarjeta. Sin compromisos.
          </p>
        </div>

        <div className="flex flex-1 justify-center lg:justify-end">
          <div className="border-border bg-card relative w-full max-w-lg rounded-lg border p-8 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>

            <div className="space-y-4">
              <div className="from-primary/20 to-primary/5 flex h-48 items-center justify-center rounded-lg bg-gradient-to-br">
                <div className="text-center">
                  <div className="text-primary mb-2 text-3xl font-bold">305.30%</div>
                  <div className="bg-primary/20 flex h-32 w-full items-end justify-center gap-2 rounded p-4">
                    <div className="bg-primary h-16 w-8 rounded"></div>
                    <div className="bg-primary h-24 w-8 rounded"></div>
                    <div className="bg-primary h-20 w-8 rounded"></div>
                    <div className="bg-primary h-28 w-8 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-4">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="text-primary-foreground text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Validación fiscal completada</div>
                  <div className="text-muted-foreground text-sm">
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
