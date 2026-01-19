"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, Clock, Calendar } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getPlanDetails, formatPrice } from "@/lib/utils/plans";
import { createPortalSessionClient } from "@/lib/api/subscription.client";
import type { Subscription, SubscriptionStatus } from "@/lib/types/subscription";
import { getTrialDaysRemaining } from "@/lib/hooks/useSubscription";
import { formatDate, getTrialProgress } from "@/lib/utils/subscription";

interface CurrentPlanCardProps {
  subscription: Subscription | null;
}

function getStatusBadge(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      );
    case "TRIALING":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Período de Prueba
        </Badge>
      );
    case "PAST_DUE":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          Pago Pendiente
        </Badge>
      );
    case "UNPAID":
      return <Badge variant="destructive">Pago Fallido</Badge>;
    case "CANCELLED":
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Cancelado
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="outline" className="border-gray-500 text-gray-500">
          Expirado
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}


export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const plan = subscription?.plan || "FREE";
  const planDetails = getPlanDetails(plan);
  const price = subscription?.planPrice || planDetails.price.monthly;
  const status = subscription?.status || "ACTIVE";
  const isTrial = status === "TRIALING";

  // Calcular días restantes del trial con actualización automática
  useEffect(() => {
    if (!isTrial || !subscription) return;

    const calculateDays = () => {
      const days = getTrialDaysRemaining(subscription);
      setDaysRemaining(days);
    };

    calculateDays();

    // Actualizar cada hora
    const interval = setInterval(calculateDays, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [isTrial, subscription]);

  // Calcular días restantes si no se ha calculado aún
  const currentDaysRemaining =
    daysRemaining !== null
      ? daysRemaining
      : subscription
        ? getTrialDaysRemaining(subscription)
        : null;

  const nextRenewal = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;

  const trialProgress = subscription
    ? getTrialProgress(
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd
      )
    : 0;

  const handleStripePortal = async () => {
    if (!subscription?.stripeCustomerId) return;

    setIsLoading(true);
    try {
      // Usar la función del cliente que maneja automáticamente la autenticación
      const data = await createPortalSessionClient();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      logger.error("Error al crear portal session", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al abrir el portal. Por favor, intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Plan Actual</h3>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold">{planDetails.name}</p>
          <p className="text-lg text-muted-foreground mt-1">
            {formatPrice(price)} / mes
          </p>
        </div>

        {/* Información del Trial */}
        {isTrial && subscription?.currentPeriodEnd && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Periodo de Prueba Activo
              </h4>
            </div>

            {currentDaysRemaining !== null && currentDaysRemaining > 0 && (
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Te quedan{" "}
                  <strong className="text-base">
                    {currentDaysRemaining} día
                    {currentDaysRemaining !== 1 ? "s" : ""}
                  </strong>{" "}
                  restantes de tu periodo de prueba.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                <span>Progreso del trial</span>
                <span className="font-medium">{Math.round(trialProgress)}%</span>
              </div>
              <Progress value={trialProgress} className="h-2" />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p>
                  El cobro de <strong>{formatPrice(price)} MXN</strong> se
                  realizará automáticamente el{" "}
                  <strong>{nextRenewal}</strong>.
                </p>
                <p className="mt-1 opacity-90">
                  Puedes cancelar en cualquier momento sin costo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información de renovación para suscripciones activas */}
        {!isTrial && nextRenewal && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Próximo cobro: {nextRenewal}</span>
          </div>
        )}

        {subscription?.stripeCustomerId && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleStripePortal}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Administrar facturación en Stripe
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
