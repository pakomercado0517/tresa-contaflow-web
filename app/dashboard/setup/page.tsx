import { Sidebar } from "@/components/layout/Sidebar";
import { SetupTabs } from "./components/SetupTabs";
import { ProfilesSection } from "./components/ProfilesSection";
import { AccountContent } from "./components/AccountContent";
import { SubscriptionContent } from "./components/SubscriptionContent";
import { getSubscription } from "@/lib/api/subscription";
import { getProfiles } from "@/lib/api/profiles";

export default async function SetupPage() {
  // No usar .catch() aquí porque captura los errores de redirect()
  // Si hay un 401, serverApiClient redirigirá automáticamente a /auth/login
  const [subscription, profiles] = await Promise.all([
    getSubscription(),
    getProfiles(),
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
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
              accountContent={<AccountContent subscription={subscription} />}
              subscriptionContent={
                <SubscriptionContent
                  subscription={subscription}
                  currentProfilesCount={profiles.count || 0}
                />
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}
