'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Leaf, Rocket, Gem, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  Leaf,
  Rocket,
  Gem,
  Building2,
};

interface PlanFeature {
  label: string;
  value: string | number;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  icon: keyof typeof iconMap;
  features: PlanFeature[];
  isPopular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'Para freelancers que inician.',
    price: {
      monthly: 0,
      annual: 0,
    },
    icon: 'Leaf',
    features: [
      { label: 'RFC Emisor', value: 1 },
      { label: 'Archivos XML / mes', value: 50 },
      { label: 'Validación básica', value: 'Sí' },
    ],
  },
  {
    id: 'BASIC',
    name: 'Básico',
    description: 'Pequeños negocios en crecimiento.',
    price: {
      monthly: 300,
      annual: 255,
    },
    icon: 'Rocket',
    features: [
      { label: 'RFCs Emisores', value: 3 },
      { label: 'Archivos XML / mes', value: 500 },
      { label: 'Exportación PDF', value: 'Sí' },
      { label: 'Reportes completos', value: 'Sí' },
      { label: 'Soporte por email', value: 'Sí' },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'Contadores y despachos.',
    price: {
      monthly: 800,
      annual: 680,
    },
    icon: 'Gem',
    features: [
      { label: 'RFCs Emisores', value: 10 },
      { label: 'Archivos XML ilimitados', value: 'Sí' },
      { label: 'Exportación PDF y Excel', value: 'Sí' },
      { label: 'Acceso a API', value: 'Sí' },
      { label: 'Soporte Prioritario', value: 'Sí' },
    ],
    isPopular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Empresarial',
    description: 'Grandes volúmenes y equipos.',
    price: {
      monthly: 1200,
      annual: 1020,
    },
    icon: 'Building2',
    features: [
      { label: 'RFCs Emisores', value: 'Ilimitados' },
      { label: 'Archivos XML', value: 'Ilimitados' },
      { label: 'Multi-usuario (Roles)', value: 'Sí' },
      { label: 'Gerente de cuenta', value: 'Sí' },
      { label: 'Integraciones personalizadas', value: 'Sí' },
    ],
  },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const formatPrice = (price: number): string => {
    if (price === 0) return 'Gratis';
    return `$${price.toLocaleString('es-MX')} MXN`;
  };

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
            className={`rounded-md px-6 py-2.5 text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`rounded-md px-6 py-2.5 text-sm font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-600">
              Ahorra 15%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const Icon = iconMap[plan.icon];
          const price = billingCycle === 'annual' ? plan.price.annual : plan.price.monthly;

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.isPopular ? 'border-primary border-2' : 'border-border'}`}
            >
              {plan.isPopular && (
                <Badge className="bg-primary text-primary-foreground absolute -top-2 right-4">
                  POPULAR
                </Badge>
              )}

              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <Icon className="text-primary h-6 w-6" />
                  <h4 className="text-xl font-semibold">{plan.name}</h4>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{formatPrice(price)}</p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {price === 0
                      ? 'Para siempre'
                      : billingCycle === 'annual'
                        ? '/ mes (facturado anualmente)'
                        : '/ mes'}
                  </p>
                  {billingCycle === 'annual' && price > 0 && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Facturación anual (15% descuento)
                    </p>
                  )}
                  {plan.id !== 'FREE' && (
                    <p className="text-primary mt-1 text-xs font-medium">
                      30 días de prueba gratuita
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-sm">
                        {typeof feature.value === 'number'
                          ? `${feature.value} ${feature.label}`
                          : `${feature.label}: ${feature.value}`}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.id === 'FREE' ? 'outline' : 'default'}
                  asChild
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
