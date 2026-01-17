"use client";

import { RefreshCw, Rocket, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getPlanDetails, formatPrice } from "@/lib/utils/plans";
import type { Subscription } from "@/lib/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription | null;
  cfdiUsed?: number; // Uso de CFDI del mes actual
}

export function SubscriptionCard({ subscription, cfdiUsed }: SubscriptionCardProps) {
  const plan = subscription?.plan || "FREE";
  const planDetails = getPlanDetails(plan);
  const price = subscription?.planPrice || planDetails.price.monthly;

  // Obtener límite de CFDI del plan
  const cfdiLimit = planDetails.xmlLimit === "unlimited" ? Infinity : planDetails.xmlLimit;
  
  // Si no se proporciona cfdiUsed, usar 0 (o se podría obtener de la API)
  const cfdiUsedValue = cfdiUsed ?? 0;
  
  const usagePercentage = cfdiLimit === Infinity ? 0 : (cfdiUsedValue / cfdiLimit) * 100;

  const nextRenewal = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tu Suscripción</CardTitle>
          {subscription?.status === "ACTIVE" && (
            <Badge className="bg-primary text-primary-foreground">ACTIVO</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Plan actual</p>
          <p className="text-2xl font-semibold">{planDetails.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatPrice(price)} MXN / mes
          </p>
        </div>

        {nextRenewal !== "N/A" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>Próxima renovación: {nextRenewal}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uso de Folios CFDI</span>
            <span className="font-medium">
              {cfdiUsedValue} / {cfdiLimit === Infinity ? "∞" : cfdiLimit}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        <div className="space-y-2 pt-2">
          <Button className="w-full" size="sm">
            <Rocket className="h-4 w-4 mr-2" />
            Mejorar Plan
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Administrar en Stripe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

