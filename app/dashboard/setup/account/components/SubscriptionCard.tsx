"use client";

import Link from "next/link";
import { RefreshCw, Rocket, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Subscription } from "@/lib/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription | null;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  // TODO: Obtener datos reales de uso de folios desde la API
  const folioUsage = {
    used: 850,
    total: 1000,
  };

  const usagePercentage = (folioUsage.used / folioUsage.total) * 100;
  const nextRenewal = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const planName =
    subscription?.plan === "FREE"
      ? "Gratuito"
      : subscription?.plan === "BASIC"
        ? "Básico"
        : subscription?.plan === "PRO"
          ? "Profesional"
          : subscription?.plan === "ENTERPRISE"
            ? "Empresarial"
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
          <p className="text-2xl font-semibold">{planName} /mes</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          <span>Próxima renovación: {nextRenewal}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uso de Folios CFDI</span>
            <span className="font-medium">
              {folioUsage.used}/{folioUsage.total}
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

