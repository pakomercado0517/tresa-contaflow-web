import { Suspense } from "react";
import { SubscriptionSuccessContent } from "./components/SubscriptionSuccessContent";

export const metadata = {
  title: "Suscripción Exitosa - ContaFlow",
  description: "Tu suscripción se ha activado correctamente",
};

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <SubscriptionSuccessContent />
      </Suspense>
    </div>
  );
}
