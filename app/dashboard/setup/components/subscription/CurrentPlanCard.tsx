"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlanDetails, formatPrice } from "@/lib/utils/plans";
import type { Subscription } from "@/lib/types/subscription";

interface CurrentPlanCardProps {
  subscription: Subscription | null;
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const plan = subscription?.plan || "FREE";
  const planDetails = getPlanDetails(plan);
  const price = subscription?.planPrice || planDetails.price.monthly;

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(
        `${apiUrl}/api/subscription/create-portal-session`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error al crear portal session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Plan Actual</h3>
          <Badge className="bg-primary text-primary-foreground">
            PLAN ACTUAL
          </Badge>
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
            {formatPrice(price)} MXN / mes
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

