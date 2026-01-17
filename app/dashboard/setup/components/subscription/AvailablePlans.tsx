"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLANS, formatPrice } from "@/lib/utils/plans";
import { createCheckoutSession } from "@/lib/api/subscription.client";
import { PromotionCodeInput } from "./PromotionCodeInput";
import {
  Leaf,
  Rocket,
  Gem,
  Building2,
  LucideIcon,
} from "lucide-react";
import type { Plan } from "@/lib/types/subscription";

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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promotionCode, setPromotionCode] = useState<string>("");

  const handleUpgrade = async (planId: Plan) => {
    // Validaciones
    if (planId === "FREE") {
      setError("El plan FREE no requiere suscripción");
      return;
    }

    if (planId === currentPlan) {
      setError("Ya tienes este plan activo");
      return;
    }

    // ENTERPRISE requiere contacto con ventas
    if (planId === "ENTERPRISE") {
      setError(
        "El plan Empresarial requiere contacto directo. Por favor, escríbenos a ventas@contaflow.com"
      );
      return;
    }

    setError(null);
    setLoadingPlan(planId);

    try {
      // Llamar a createCheckoutSession con el código de promoción (si existe)
      const data = await createCheckoutSession(
        planId as "BASIC" | "PRO",
        promotionCode || undefined
      );

      if (data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió URL de checkout");
      }
    } catch (err) {
      logger.error("Error al crear checkout", err);
      
      // Manejar errores específicos de código de descuento
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al procesar la solicitud. Por favor, intenta nuevamente.";
      
      // Si el error es sobre código inválido, limpiar el código
      if (
        errorMessage.includes("código") ||
        errorMessage.includes("descuento") ||
        errorMessage.includes("inválido") ||
        errorMessage.includes("expiró")
      ) {
        setPromotionCode("");
      }
      
      setError(errorMessage);
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
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Procesando checkout...
            </DialogTitle>
            <DialogDescription className="pt-2">
              Estamos preparando tu sesión de pago con Stripe. Por favor espera mientras te redirigimos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Redirigiendo a Stripe Checkout...
              </p>
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
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle("monthly")}
            disabled={loadingPlan !== null}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            disabled={loadingPlan !== null}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual (-20%)
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const Icon = iconMap[plan.icon];
          const price =
            billingCycle === "monthly"
              ? plan.price.monthly
              : plan.price.annual;
          const isCurrentPlan = plan.id === currentPlan;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.isPopular
                  ? "border-primary border-2"
                  : "border-border"
              }`}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                  POPULAR
                </Badge>
              )}

              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {Icon && <Icon className="h-6 w-6 text-primary" />}
                  <h4 className="text-xl font-semibold">{plan.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">{formatPrice(price)}</p>
                  <p className="text-sm text-muted-foreground">/ mes</p>
                  {billingCycle === "annual" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Facturación anual
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {typeof feature.value === "number"
                          ? `${feature.value} ${feature.label}`
                          : `${feature.label}: ${feature.value}`}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || loadingPlan !== null}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : isCurrentPlan ? (
                    "Plan Actual"
                  ) : plan.id === "FREE" ? (
                    "Plan Gratuito"
                  ) : plan.id === "ENTERPRISE" ? (
                    "Contactar Ventas"
                  ) : (
                    "Mejorar Plan"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Sales CTA */}
      <div className="text-center pt-6">
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
