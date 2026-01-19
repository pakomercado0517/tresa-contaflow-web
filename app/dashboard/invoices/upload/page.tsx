import { getProfiles } from "@/lib/api/profiles";
import { getSubscription } from "@/lib/api/subscription";
import { getMetrics } from "@/lib/api/invoices";
import { UploadInvoicesContent } from "./components/UploadInvoicesContent";

export default async function UploadInvoicesPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Obtener perfiles, suscripción y métricas del mes actual
  const [profiles, subscription, metrics] = await Promise.all([
    getProfiles(),
    getSubscription().catch(() => null),
    getMetrics(undefined, currentMonth, currentYear),
  ]);

  // Calcular uso actual de facturas del mes
  const invoicesUsed = metrics.metrics.totalFacturas || 0;

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <UploadInvoicesContent
        profiles={profiles.data}
        subscription={subscription}
        invoicesUsed={invoicesUsed}
      />
    </main>
  );
}

