'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLANS, formatPrice } from '@/lib/utils/plans';
import type { Plan } from '@/lib/types/subscription';
import Link from 'next/link';

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
  recommendedPlan = 'BASIC',
}: UpgradeModalProps) {
  const planDetails = PLANS.find((p) => p.id === recommendedPlan);

  if (!planDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <DialogTitle>Mejora tu Plan</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-left">{feature}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{planDetails.name}</h3>
              <p className="text-lg font-bold">
                {formatPrice(planDetails.price.monthly)}
                <span className="text-muted-foreground text-sm font-normal">/mes</span>
              </p>
            </div>
            <p className="text-muted-foreground mb-3 text-sm">{planDetails.description}</p>
            <ul className="space-y-2">
              {planDetails.features.map((feature) => (
                <li key={feature.label} className="flex items-start gap-2 text-sm">
                  <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {typeof feature.value === 'number'
                      ? `${feature.value} ${feature.label}`
                      : `${feature.label}: ${feature.value}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950/20">
            <p className="mb-1 font-medium text-blue-900 dark:text-blue-100">
              Período de prueba de 30 días
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Prueba todas las características sin costo durante 30 días.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
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
