import { Suspense } from 'react';
import { SubscriptionSuccessContent } from './components/SubscriptionSuccessContent';

export const metadata = {
  title: 'Suscripción Exitosa - Contafy',
  description: 'Tu suscripción se ha activado correctamente',
};

export default function SubscriptionSuccessPage() {
  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-linear-to-b p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <SubscriptionSuccessContent />
      </Suspense>
    </div>
  );
}
