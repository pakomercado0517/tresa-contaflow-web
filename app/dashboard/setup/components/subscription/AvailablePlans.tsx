"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, getPlanDetails, formatPrice } from "@/lib/utils/plans";
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

  const handleUpgrade = async (planId: Plan) => {
    if (planId === "FREE" || planId === currentPlan) {
      return;
    }

    // Solo BASIC y PRO están disponibles para checkout directo
    // ENTERPRISE requiere contacto con ventas
    if (planId === "ENTERPRISE") {
      // TODO: Implementar flujo de contacto con ventas
      alert("Por favor, contacta a ventas para el plan Empresarial");
      return;
    }

    try {
      // Usar proxy de Next.js para evitar CORS
      const response = await fetch("/backend/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          plan: planId as "BASIC" | "PRO",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear sesión de checkout");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error al crear checkout:", error);
      alert("Error al procesar la solicitud. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Planes Disponibles</h3>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle("monthly")}
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
                  disabled={isCurrentPlan}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrentPlan
                    ? "Plan Actual"
                    : plan.id === "FREE"
                      ? "Seleccionar"
                      : "Mejorar Plan"}
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

