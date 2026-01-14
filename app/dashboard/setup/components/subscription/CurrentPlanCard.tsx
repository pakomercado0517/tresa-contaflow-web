"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlanDetails, formatPrice } from "@/lib/utils/plans";
import { createPortalSessionClient } from "@/lib/api/subscription.client";
import type { Subscription, SubscriptionStatus } from "@/lib/types/subscription";

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
  const plan = subscription?.plan || "FREE";
  const planDetails = getPlanDetails(plan);
  const price = subscription?.planPrice || planDetails.price.monthly;
  const status = subscription?.status || "ACTIVE";

  const nextRenewal = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

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
      console.error("Error al crear portal session:", error);
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
        {nextRenewal && (
          <p className="text-sm text-muted-foreground">
            Renovación: {nextRenewal}
          </p>
        )}
        <div>
          <p className="text-3xl font-bold">{planDetails.name}</p>
          <p className="text-lg text-muted-foreground mt-1">
            {formatPrice(price)} / mes
          </p>
        </div>
        {subscription?.stripeCustomerId && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleStripePortal}
            disabled={isLoading}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isLoading ? "Cargando..." : "Administrar facturación en Stripe"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
