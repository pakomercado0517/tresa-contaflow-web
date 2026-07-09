'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatPrice, getPlanDetailsFromAvailable } from '@/lib/utils/plans';
import { createCheckoutSession } from '@/lib/api/subscription.client';
import { availablePlansQueryOptions } from '@/lib/query/available-plans-query';
import { PromotionCodeInput } from './PromotionCodeInput';
import { Leaf, Rocket, Gem, Building2, LucideIcon } from 'lucide-react';
import type { Plan } from '@/lib/types/subscription';

interface AvailablePlansProps {
  currentPlan: Plan;
}

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Rocket,
  Gem,
  Building2,
};

export function AvailablePlans({ currentPlan }: AvailablePlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [promotionCode, setPromotionCode] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const {
    data: plansResponse,
    isPending: isLoadingPlans,
    isError: isPlansError,
    error: plansQueryError,
  } = useQuery(availablePlansQueryOptions(billingCycle));

  const availablePlans = plansResponse?.plans ?? [];
  const plansFetchError = isPlansError
    ? plansQueryError instanceof Error
      ? plansQueryError.message
      : 'Error al cargar los planes disponibles'
    : null;
  const error = checkoutError ?? plansFetchError;

  const handleUpgrade = async (planId: Plan) => {
    // Validaciones
    if (planId === 'FREE') {
      setCheckoutError('El plan FREE no requiere suscripción');
      return;
    }

    if (planId === currentPlan) {
      setCheckoutError('Ya tienes este plan activo');
      return;
    }

    // ENTERPRISE requiere contacto con ventas
    if (planId === 'ENTERPRISE') {
      setCheckoutError(
        'El plan Empresarial requiere contacto directo. Por favor, escríbenos a ventas@contafy.com'
      );
      return;
    }

    setCheckoutError(null);
    setLoadingPlan(planId);

    try {
      // Llamar a createCheckoutSession con el código de promoción (si existe)
      const data = await createCheckoutSession(
        planId as 'BASIC' | 'PRO',
        promotionCode || undefined,
        billingCycle
      );

      if (data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (err) {
      logger.error('Error al crear checkout', err);

      // Manejar errores específicos de código de descuento
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al procesar la solicitud. Por favor, intenta nuevamente.';

      // Si el error es sobre código inválido, limpiar el código
      if (
        errorMessage.includes('código') ||
        errorMessage.includes('descuento') ||
        errorMessage.includes('inválido') ||
        errorMessage.includes('expiró')
      ) {
        setPromotionCode('');
      }

      setCheckoutError(errorMessage);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay Dialog */}
      <Dialog open={loadingPlan !== null} modal>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
              Procesando checkout...
            </DialogTitle>
            <DialogDescription className="pt-2">
              Estamos preparando tu sesión de pago con Stripe. Por favor espera mientras te
              redirigimos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">Redirigiendo a Stripe Checkout...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Promotion Code Input */}
      <PromotionCodeInput
        value={promotionCode}
        onChange={setPromotionCode}
        disabled={loadingPlan !== null}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Planes Disponibles</h3>

        {/* Billing Cycle Toggle */}
        <div className="bg-muted flex items-center gap-2 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            disabled={loadingPlan !== null}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            disabled={loadingPlan !== null}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual (-15%)
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      {isLoadingPlans ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="bg-muted mb-2 h-6 w-3/4 rounded"></div>
                <div className="bg-muted h-4 w-full rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted mb-4 h-8 w-1/2 rounded"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-muted h-4 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {availablePlans.map((plan) => {
            const planDetails = getPlanDetailsFromAvailable(plan);
            const Icon = iconMap[planDetails.icon];
            const price = plan.price;
            const originalPrice = plan.originalPrice;
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  planDetails.isPopular ? 'border-primary border-2' : 'border-border'
                }`}
              >
                {planDetails.isPopular && (
                  <Badge className="bg-primary text-primary-foreground absolute -top-2 right-4">
                    POPULAR
                  </Badge>
                )}

                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    {Icon && <Icon className="text-primary h-6 w-6" />}
                    <h4 className="text-xl font-semibold">{planDetails.name}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">{planDetails.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{formatPrice(price)}</p>
                      {originalPrice && originalPrice > price && (
                        <p className="text-muted-foreground text-lg line-through">
                          {formatPrice(originalPrice)}
                        </p>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {billingCycle === 'annual' ? '/ año' : '/ mes'}
                    </p>
                    {billingCycle === 'annual' && originalPrice && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Facturación anual (15% descuento)
                      </p>
                    )}
                    {plan.trialDays && (
                      <p className="text-primary mt-1 text-xs font-medium">
                        {plan.trialDays} días de prueba gratuita
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {planDetails.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-2">
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
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan || loadingPlan !== null}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : isCurrentPlan ? (
                      'Plan Actual'
                    ) : plan.id === 'FREE' ? (
                      'Plan Gratuito'
                    ) : plan.id === 'ENTERPRISE' ? (
                      'Contactar Ventas'
                    ) : (
                      'Mejorar Plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Contact Sales CTA */}
      <div className="pt-6 text-center">
        <p className="text-muted-foreground mb-2">
          ¿Necesitas un plan personalizado con mayor volumen de facturación?
        </p>
        <Button variant="link" className="text-primary">
          Contactar a Ventas
        </Button>
      </div>
    </div>
  );
}
