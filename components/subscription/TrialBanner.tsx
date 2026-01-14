"use client";

import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

interface TrialBannerProps {
  daysRemaining: number;
  planName: string;
}

export function TrialBanner({ daysRemaining, planName }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const isUrgent = daysRemaining <= 7;

  return (
    <Alert
      className={`relative ${
        isUrgent
          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
          : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
      }`}
    >
      <AlertCircle
        className={`h-4 w-4 ${isUrgent ? "text-orange-600" : "text-blue-600"}`}
      />
      <AlertTitle className="flex items-center justify-between pr-8">
        <span>Período de Prueba - Plan {planName}</span>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        {daysRemaining > 0 ? (
          <>
            Te quedan <strong>{daysRemaining} días</strong> de prueba gratuita.
            Después de este período, se realizará el cargo automáticamente.
          </>
        ) : (
          <>
            Tu período de prueba termina hoy. El cargo se realizará
            automáticamente.
          </>
        )}
        <div className="mt-2">
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
