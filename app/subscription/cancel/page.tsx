'use client';

import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/dashboard/setup?tab=subscription');
  };

  const handleTryAgain = () => {
    router.push('/dashboard/setup?tab=subscription');
  };

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-linear-to-b p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Pago Cancelado</CardTitle>
          <CardDescription>El proceso de suscripción fue cancelado</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">
              No te preocupes, no se realizó ningún cargo a tu tarjeta. Puedes intentar nuevamente
              cuando estés listo.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">¿Por qué cancelaste?</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>¿Necesitas más información sobre los planes?</li>
              <li>¿Tienes dudas sobre las características?</li>
              <li>¿Prefieres probar el plan gratuito primero?</li>
            </ul>
          </div>

          <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">Recuerda: Plan FREE siempre disponible</p>
            <p className="text-muted-foreground text-sm">
              Puedes usar Contafy con el plan gratuito sin necesidad de suscripción. Incluye 1 RFC y
              50 archivos XML al mes.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleTryAgain}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar Nuevamente
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
