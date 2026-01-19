import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardGreeting } from "./DashboardGreeting";
import { MetricsCards } from "./MetricsCards";
import { RecentInvoicesTable } from "./RecentInvoicesTable";
import { RecentExpensesTable } from "./RecentExpensesTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { TrialBannerWrapper } from "./TrialBannerWrapper";
import { getMetrics, getInvoices, getTrendData } from "@/lib/api/invoices";
import { getExpenses } from "@/lib/api/expenses";
import { getProfiles } from "@/lib/api/profiles";
import { getCurrentUser } from "@/lib/api/auth.server";

// Lazy load componentes pesados (jsPDF y Recharts)
// Nota: Estos componentes ya son Client Components, el lazy loading reduce el bundle inicial
const ExportPDFButton = dynamic(() => import("./ExportPDFButton").then((mod) => ({ default: mod.ExportPDFButton })), {
  loading: () => <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />,
});

const FlowTrendChart = dynamic(() => import("./FlowTrendChart").then((mod) => ({ default: mod.FlowTrendChart })), {
  loading: () => (
    <div className="h-96 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center">
      <LoadingSpinner message="Cargando gráfico..." />
    </div>
  ),
});

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
  const [metrics, invoices, expenses, profiles, trendData, currentUser] = await Promise.all([
    getMetrics(profileId, mes, año),
    getInvoices({ profileId, mes, año, limit: 3 }),
    getExpenses({ profileId, mes, año, limit: 3 }),
    getProfiles(),
    getTrendData(profileId, año),
    getCurrentUser(),
  ]);

  const activeProfile = profiles.data.find((p) => p.id === profileId) ||
    profiles.data[0];
  const selectedCompanyName = profileId
    ? activeProfile?.nombre
    : profiles.data.length > 0
      ? "Todas las empresas"
      : undefined;

  // Obtener el nombre del usuario para mostrar
  const userName = currentUser.user.nombre || currentUser.user.email.split("@")[0];

  // Calcular métricas para el PDF
  const totalFacturado = metrics.metrics.totalFacturado || 0;
  const totalPagado = metrics.metrics.totalPagado || 0;
  const totalCompras = metrics.metrics.totalCompras || 0;
  const pendientePorPagar = totalFacturado - totalPagado;
  const diferencia = totalFacturado - totalCompras;

  return (
    <>
      <DashboardHeader
        profiles={profiles.data || []}
        selectedProfileId={profileId}
        selectedMonth={mes}
        selectedYear={año}
        companyName={selectedCompanyName}
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
        {/* Trial Banner - Solo se muestra si el usuario está en trial */}
        <TrialBannerWrapper />
        
        <div className="flex items-center justify-between">
          <DashboardGreeting userName={userName} companyName={selectedCompanyName} />
          <ExportPDFButton
            profileId={profileId}
            profileName={activeProfile?.nombre}
            rfc={activeProfile?.rfc}
            mes={mes}
            año={año}
            metrics={{
              totalFacturado,
              totalPagado,
              totalCompras,
              pendientePorPagar,
              diferencia,
            }}
          />
        </div>
        <MetricsCards metrics={metrics.metrics} />
        <Suspense fallback={
          <div className="h-96 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center">
            <LoadingSpinner message="Cargando gráfico..." />
          </div>
        }>
          <FlowTrendChart data={trendData} />
        </Suspense>
        <div className="grid gap-6 md:grid-cols-2">
          <RecentInvoicesTable invoices={invoices.data} />
          <RecentExpensesTable expenses={expenses.data} />
        </div>
      </main>
    </>
  );
}

