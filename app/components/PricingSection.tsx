'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Check, Leaf, Rocket, Gem, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPublicPlansClient } from '@/lib/api/subscription.client';
import type { PublicPlan } from '@/lib/types/subscription';

const iconMap = {
  Leaf,
  Rocket,
  Gem,
  Building2,
};

interface PricingSectionProps {
  initialPlans: PublicPlan[];
}

// Mapeo de IDs de planes a íconos y descripciones
const planMetadata = {
  FREE: {
    icon: 'Leaf' as const,
    description: 'Para freelancers que inician.',
    isPopular: false,
  },
  BASIC: {
    icon: 'Rocket' as const,
    description: 'Pequeños negocios en crecimiento.',
    isPopular: false,
  },
  PRO: {
    icon: 'Gem' as const,
    description: 'Contadores y despachos.',
    isPopular: true,
  },
  ENTERPRISE: {
    icon: 'Building2' as const,
    description: 'Grandes volúmenes y equipos.',
    isPopular: false,
  },
};

export function PricingSection({ initialPlans }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // React Query para obtener planes cuando cambia el ciclo de facturación
  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicPlans', billingCycle],
    queryFn: async () => {
      console.log('Fetching plans for billing:', billingCycle);
      const result = await getPublicPlansClient(billingCycle);
      console.log('Received plans:', result);
      return result;
    },
    // Solo precarga para monthly en el primer render
    placeholderData: (previousData) => {
      // Si estamos en monthly y tenemos initialPlans, usarlos como placeholder
      if (billingCycle === 'monthly' && initialPlans.length > 0 && !previousData) {
        return { plans: initialPlans, billing: 'monthly' as const };
      }
      return previousData;
    },
    staleTime: 0, // Siempre refetch cuando cambia billingCycle
    gcTime: 1000 * 60 * 5, // Mantener en cache 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Usar datos de la query o planes iniciales
  const plans = useMemo(() => {
    return data?.plans || initialPlans;
  }, [data, initialPlans]);

  const formatPrice = (price: number): string => {
    if (price === 0) return 'Gratis';
    return `$${price.toLocaleString('es-MX')} MXN`;
  };

  const formatLimitValue = (value: number | null | undefined, label: string): string => {
    if (value === null || value === undefined) return `${label}: Ilimitados`;
    if (typeof value === 'number') return `${value} ${label}`;
    return `${label}: ${value}`;
  };

  // Funciones auxiliares para obtener features desde los límites
  const getFeaturesFromLimits = (plan: PublicPlan): Array<{ label: string; value: string }> => {
    const features: Array<{ label: string; value: string }> = [];

    if (plan.limits.profiles !== null) {
      features.push({ label: 'RFCs Emisores', value: plan.limits.profiles.toString() });
    } else {
      features.push({ label: 'RFCs Emisores', value: 'Ilimitados' });
    }

    if (plan.limits.invoicesPerMonth !== null) {
      features.push({
        label: 'Facturas/mes',
        value: plan.limits.invoicesPerMonth.toString(),
      });
    } else {
      features.push({ label: 'Facturas/mes', value: 'Ilimitadas' });
    }

    if (plan.limits.exportPDF) {
      features.push({ label: 'Exportación PDF', value: 'Sí' });
    }

    if (plan.limits.exportExcel) {
      features.push({ label: 'Exportación Excel', value: 'Sí' });
    }

    if (plan.limits.reports !== 'basic') {
      const reportLabel = plan.limits.reports === 'complete' ? 'Completos' : 'Avanzados';
      features.push({ label: 'Reportes', value: reportLabel });
    }

    if (plan.limits.support !== 'none') {
      const supportLabel = plan.limits.support === 'email' ? 'Email' : 'Prioritario';
      features.push({ label: 'Soporte', value: supportLabel });
    }

    if (plan.limits.apiAccess) {
      features.push({ label: 'Acceso a API', value: 'Sí' });
    }

    // Características SAT
    if (plan.limits.satAISearchesPerMonth !== null) {
      features.push({
        label: 'Búsquedas SAT con IA',
        value: plan.limits.satAISearchesPerMonth.toString(),
      });
    }

    if (plan.limits.satHasHistory) {
      features.push({ label: 'Historial SAT', value: 'Sí' });
    }

    if (plan.limits.satHasFavorites) {
      features.push({ label: 'Favoritos SAT', value: 'Sí' });
    }

    return features.slice(0, 5); // Mostrar máximo 5 características
  };

  if (isError && initialPlans.length === 0) {
    return (
      <section id="precios" className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
        <div className="mb-12 text-center">
          <div className="bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5">
            <span className="text-primary text-sm font-medium">
              Planes transparentes y sin letra chica
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Sin compromisos. Cancela cuando quieras. Empieza con 30 días gratis.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-amber-800">
              Por el momento no podemos mostrarte los planes, registrate para poder verlos.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/auth/register">Ir a Registro</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="precios" className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
      <div className="mb-12 text-center">
        <div className="bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5">
          <span className="text-primary text-sm font-medium">
            Planes transparentes y sin letra chica
          </span>
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Elige el plan perfecto para ti
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Sin compromisos. Cancela cuando quieras. Empieza con 30 días gratis.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="mb-12 flex justify-center">
        <div className="bg-muted flex items-center gap-2 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            disabled={isLoading}
            className={`rounded-md px-6 py-2.5 text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            disabled={isLoading}
            className={`rounded-md px-6 py-2.5 text-sm font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            Anual
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                billingCycle === 'annual'
                  ? 'bg-white/20 text-white'
                  : 'bg-green-500/20 text-green-600'
              }`}
            >
              Ahorra 15%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div
        className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {plans.map((plan) => {
          const metadata = planMetadata[plan.id as keyof typeof planMetadata];
          const Icon = iconMap[metadata.icon];
          const features = getFeaturesFromLimits(plan);
          const showDiscount = billingCycle === 'annual' && plan.originalPrice !== null;

          return (
            <Card
              key={plan.id}
              className={`relative ${metadata.isPopular ? 'border-primary border-2' : 'border-border'}`}
            >
              {metadata.isPopular && (
                <Badge className="bg-primary text-primary-foreground absolute -top-2 right-4">
                  POPULAR
                </Badge>
              )}

              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <Icon className="text-primary h-6 w-6" />
                  <h4 className="text-xl font-semibold">{plan.name}</h4>
                </div>
                <p className="text-muted-foreground text-sm">{metadata.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{formatPrice(plan.price)}</p>
                    {showDiscount && (
                      <span className="text-muted-foreground text-sm line-through">
                        {formatPrice(plan.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {plan.price === 0
                      ? 'Para siempre'
                      : billingCycle === 'annual'
                        ? '/ mes (facturado anualmente)'
                        : '/ mes'}
                  </p>
                  {showDiscount && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Facturación anual (15% descuento)
                    </p>
                  )}
                  {plan.trialDays !== null && plan.id !== 'FREE' && (
                    <p className="text-primary mt-1 text-xs font-medium">
                      {plan.trialDays} días de prueba gratuita
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-sm">
                        {feature.label}: {feature.value}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.id === 'FREE' ? 'outline' : 'default'}
                  asChild
                  disabled={isLoading}
                >
                  <Link
                    href={
                      plan.id === 'ENTERPRISE' ? 'mailto:ventas@contaflow.com' : '/auth/register'
                    }
                  >
                    {plan.id === 'FREE'
                      ? 'Comenzar Gratis'
                      : plan.id === 'ENTERPRISE'
                        ? 'Contactar Ventas'
                        : 'Empezar Prueba Gratis'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ o Trust Message */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm">
          ¿Tienes dudas sobre qué plan elegir?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">
            Empieza gratis
          </Link>{' '}
          y decide después.
        </p>
      </div>
    </section>
  );
}
