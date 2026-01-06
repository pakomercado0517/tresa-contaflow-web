import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardGreeting } from "./DashboardGreeting";
import { MetricsCards } from "./MetricsCards";
import { FlowTrendChart } from "./FlowTrendChart";
import { RecentInvoicesTable } from "./RecentInvoicesTable";
import { RecentExpensesTable } from "./RecentExpensesTable";
import { getMetrics, getInvoices } from "@/lib/api/invoices";
import { getExpenses } from "@/lib/api/expenses";
import { getProfiles } from "@/lib/api/profiles";

interface DashboardContentProps {
  searchParams?: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
  }>;
}

export async function DashboardContent({
  searchParams,
}: DashboardContentProps) {
  const params = await searchParams;
  const profileId = params?.profileId;
  const mes = params?.mes ? Number(params.mes) : new Date().getMonth() + 1;
  const año = params?.año ? Number(params.año) : new Date().getFullYear();

  // No usar .catch() aquí porque captura los errores de redirect()
  // Si hay un 401, serverApiClient redirigirá automáticamente a /auth/login
  const [metrics, invoices, expenses, profiles] = await Promise.all([
    getMetrics(profileId, mes, año),
    getInvoices({ profileId, mes, año, limit: 3 }),
    getExpenses({ profileId, mes, año, limit: 3 }),
    getProfiles(),
  ]);

  const activeProfile = profiles.data.find((p) => p.id === profileId) ||
    profiles.data[0];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <DashboardHeader
          profiles={profiles.data || []}
          selectedProfileId={profileId}
          selectedMonth={mes}
          selectedYear={año}
          companyName={activeProfile?.nombre}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          <DashboardGreeting companyName={activeProfile?.nombre} />
          <MetricsCards metrics={metrics.metrics} />
          <FlowTrendChart />
          <div className="grid gap-6 md:grid-cols-2">
            <RecentInvoicesTable invoices={invoices.data} />
            <RecentExpensesTable expenses={expenses.data} />
          </div>
        </main>
      </div>
    </div>
  );
}

