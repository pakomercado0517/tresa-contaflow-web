import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SetupTabs } from "./components/SetupTabs";
import { ProfilesSection } from "./components/ProfilesSection";
import { AccountContent } from "./components/AccountContent";
import { SubscriptionContent } from "./components/SubscriptionContent";
import { SATDownloadContent } from "./components/SATDownloadContent";
import { getSubscription } from "@/lib/api/subscription";
import { getProfiles } from "@/lib/api/profiles";
import { getCurrentUser } from "@/lib/api/auth.server";
import { getInvoices } from "@/lib/api/invoices";
import { getExpenses } from "@/lib/api/expenses";
import { getSATStats } from "@/lib/api/sat";
import { getCurrentMonthYearInAppTimezone } from "@/lib/utils/app-calendar";

export default async function SetupPage() {
  const { mes: currentMonth, año: currentYear } = getCurrentMonthYearInAppTimezone();

  const [subscription, profiles, currentUser, invoicesRes, expensesRes, satStats] =
    await Promise.all([
      getSubscription(),
      getProfiles(),
      getCurrentUser(),
      getInvoices({ mes: currentMonth, año: currentYear, limit: 1 }),
      getExpenses({ mes: currentMonth, año: currentYear, limit: 1 }),
      getSATStats().catch(() => null),
    ]);

  const xmlUsed =
    (invoicesRes.pagination?.total ?? 0) + (expensesRes.pagination?.total ?? 0);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tus perfiles, cuenta y suscripción
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex min-h-40 items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
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
            satDownloadContent={<SATDownloadContent profiles={profiles.data || []} />}
          />
        </Suspense>
      </div>
    </main>
  );
}
