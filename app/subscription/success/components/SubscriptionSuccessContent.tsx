"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubscriptionClient } from "@/lib/api/subscription.client";
import type { Subscription } from "@/lib/types/subscription";

export function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Esperar 2 segundos para dar tiempo al webhook de procesar
    const timer = setTimeout(async () => {
      try {
        const data = await getSubscriptionClient();
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setIsLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoToSettings = () => {
    router.push("/dashboard/setup?tab=subscription");
  };

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          )}
        </div>
        <CardTitle className="text-2xl">¡Pago Exitoso!</CardTitle>
        <CardDescription>
          {isLoading
            ? "Estamos activando tu suscripción..."
            : "Tu suscripción se ha activado correctamente"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {sessionId && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-foreground">ID de Sesión:</p>
            <p className="font-mono text-xs break-all">{sessionId}</p>
          </div>
        )}

        {!isLoading && subscription && (
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-semibold">{subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <span className="font-semibold">
                {subscription.status === "TRIALING"
                  ? "Período de Prueba"
                  : "Activo"}
              </span>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {subscription.status === "TRIALING"
                    ? "Fin de prueba:"
                    : "Próxima renovación:"}
                </span>
                <span className="font-semibold">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "es-MX",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {subscription?.status === "TRIALING" && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              <strong>Período de prueba de 30 días</strong>
            </p>
            <p className="mt-1 text-blue-700 dark:text-blue-300">
              Disfruta de todas las características de tu plan sin costo durante
              30 días. Después, se realizará el cargo automáticamente.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={handleGoToDashboard}
          disabled={isLoading}
        >
          Ir al Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoToSettings}
          disabled={isLoading}
        >
          Ver Detalles de Suscripción
        </Button>
      </CardFooter>
    </Card>
  );
}
