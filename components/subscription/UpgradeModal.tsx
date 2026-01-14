"use client";

import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLANS, formatPrice } from "@/lib/utils/plans";
import type { Plan } from "@/lib/types/subscription";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan;
  feature: string;
  recommendedPlan?: Plan;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  feature,
  recommendedPlan = "BASIC",
}: UpgradeModalProps) {
  const planDetails = PLANS.find((p) => p.id === recommendedPlan);

  if (!planDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Mejora tu Plan</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left pt-2">
            {feature}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{planDetails.name}</h3>
              <p className="text-lg font-bold">
                {formatPrice(planDetails.price.monthly)}
                <span className="text-sm font-normal text-muted-foreground">
                  /mes
                </span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {planDetails.description}
            </p>
            <ul className="space-y-2">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    {typeof feature.value === "number"
                      ? `${feature.value} ${feature.label}`
                      : `${feature.label}: ${feature.value}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Período de prueba de 30 días
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Prueba todas las características sin costo durante 30 días.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Link href="/dashboard/setup?tab=subscription" className="w-full">
            <Button className="w-full" onClick={onClose}>
              <Sparkles className="mr-2 h-4 w-4" />
              Mejorar a {planDetails.name}
            </Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Continuar con {currentPlan}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
