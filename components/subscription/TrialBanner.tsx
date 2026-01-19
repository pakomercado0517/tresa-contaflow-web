"use client";

import { AlertCircle, X, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Subscription } from "@/lib/types/subscription";
import { getTrialDaysRemaining } from "@/lib/hooks/useSubscription";
import { formatPrice } from "@/lib/utils/plans";
import {
  formatTrialEndDate,
  getTrialProgress,
  getTrialUrgencyLevel,
} from "@/lib/utils/subscription";

interface TrialBannerProps {
  subscription: Subscription;
}

export function TrialBanner({ subscription }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Calcular días restantes inicialmente
  useEffect(() => {
    const calculateDays = () => {
      const days = getTrialDaysRemaining(subscription);
      setDaysRemaining(days);
    };

    calculateDays();

    // Actualizar cada hora
    const interval = setInterval(calculateDays, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [subscription]);

  // Calcular días restantes si no se ha calculado aún
  const currentDaysRemaining =
    daysRemaining !== null
      ? daysRemaining
      : getTrialDaysRemaining(subscription);

  if (isDismissed || !subscription.currentPeriodEnd) return null;

  const urgency = getTrialUrgencyLevel(currentDaysRemaining);
  const isUrgent = urgency.level === "warning";
  const isVeryUrgent = urgency.level === "urgent";
  const trialEndDate = formatTrialEndDate(subscription.currentPeriodEnd);
  const progress = getTrialProgress(
    subscription.currentPeriodStart,
    subscription.currentPeriodEnd
  );

  // Determinar el nivel de alerta según días restantes
  const getAlertVariant = () => {
    if (isVeryUrgent) {
      return "border-red-500 bg-red-50 dark:bg-red-950/20";
    }
    if (isUrgent) {
      return "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
    }
    return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
  };

  const getIconColor = () => {
    if (isVeryUrgent) return "text-red-600";
    if (isUrgent) return "text-orange-600";
    return "text-blue-600";
  };

  return (
    <Alert className={`relative ${getAlertVariant()}`}>
      <AlertCircle className={`h-4 w-4 ${getIconColor()}`} />
      <AlertTitle className="flex items-center justify-between pr-8">
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${getIconColor()}`} />
          <span>
            {isVeryUrgent
              ? "Periodo de Prueba Finaliza Pronto"
              : isUrgent
                ? "Periodo de Prueba Finaliza Próximamente"
                : `Periodo de Prueba - Plan ${subscription.plan}`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <div>
          {currentDaysRemaining !== null && currentDaysRemaining > 0 ? (
            <>
              <p className="text-sm">
                Te quedan{" "}
                <strong className="text-base">
                  {currentDaysRemaining} día
                  {currentDaysRemaining !== 1 ? "s" : ""}
                </strong>{" "}
                de prueba gratuita.
              </p>
              <p className="text-xs mt-1 opacity-90">
                El cobro de{" "}
                <strong>{formatPrice(subscription.planPrice)} MXN</strong> se
                realizará automáticamente el{" "}
                <strong>{trialEndDate}</strong>. Puedes cancelar en cualquier
                momento sin costo.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm">
                Tu período de prueba termina hoy. El cobro de{" "}
                <strong>{formatPrice(subscription.planPrice)} MXN</strong> se
                realizará automáticamente.
              </p>
            </>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-75">Progreso del trial</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="pt-1">
          <Link href="/dashboard/setup?tab=subscription">
            <Button variant="link" className="h-auto p-0 text-primary">
              Gestionar suscripción →
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}
