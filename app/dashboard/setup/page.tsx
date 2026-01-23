import { SetupTabs } from "./components/SetupTabs";
import { ProfilesSection } from "./components/ProfilesSection";
import { AccountContent } from "./components/AccountContent";
import { SubscriptionContent } from "./components/SubscriptionContent";
import { getSubscription } from "@/lib/api/subscription";
import { getProfiles } from "@/lib/api/profiles";
import { getCurrentUser } from "@/lib/api/auth.server";
import { getMetrics } from "@/lib/api/invoices";
import { getSATStats } from "@/lib/api/sat";

export default async function SetupPage() {
  // No usar .catch() aquí porque captura los errores de redirect()
  // Si hay un 401, serverApiClient redirigirá automáticamente a /auth/login
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [subscription, profiles, currentUser, metrics, satStats] = await Promise.all([
    getSubscription(),
    getProfiles(),
    getCurrentUser(),
    getMetrics(undefined, currentMonth, currentYear),
    getSATStats().catch(() => null), // Si falla, continuar sin datos SAT
  ]);

  // Calcular el uso de XML/CFDI del mes actual (facturas + gastos)
  const xmlUsed = metrics.metrics.totalFacturas + metrics.metrics.totalGastos;

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tus perfiles, cuenta y suscripción
          </p>
        </div>
        <SetupTabs
          profilesContent={<ProfilesSection />}
          accountContent={<AccountContent subscription={subscription} user={currentUser.user} />}
          subscriptionContent={
            <SubscriptionContent
              subscription={subscription}
              currentProfilesCount={profiles.count || 0}
              xmlUsed={xmlUsed}
              satPlanInfo={satStats?.planInfo}
            />
          }
        />
      </div>
    </main>
  );
}
