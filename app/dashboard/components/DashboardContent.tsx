import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardHeader } from './DashboardHeader';
import { DashboardGreeting } from './DashboardGreeting';
import { MetricsCards } from './MetricsCards';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { RecentExpensesTable } from './RecentExpensesTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TrialBannerWrapper } from './TrialBannerWrapper';
import { getMetrics, getInvoices, getDashboardTrendMetricsRange } from '@/lib/api/invoices';
import { getExpenses } from '@/lib/api/expenses';
import { getProfiles } from '@/lib/api/profiles';
import { getCurrentUser } from '@/lib/api/auth.server';
import {
  buildTrendSeriesForView,
  findMetricsItemForMonth,
} from '@/lib/utils/metrics-trend-range';
import { metricsByMonthItemToPeriodMetrics } from '@/lib/types/metrics';

// Lazy load componentes pesados (jsPDF y Recharts)
// Nota: Estos componentes ya son Client Components, el lazy loading reduce el bundle inicial
const ExportPDFButton = dynamic(
  () => import('./ExportPDFButton').then((mod) => ({ default: mod.ExportPDFButton })),
  {
    loading: () => <div className="bg-muted h-10 w-32 animate-pulse rounded-md" />,
  }
);

const ShareReportButton = dynamic(
  () => import('./ShareReportButton').then((mod) => ({ default: mod.ShareReportButton })),
  {
    loading: () => <div className="bg-muted h-10 w-28 animate-pulse rounded-md" />,
  }
);

const FlowTrendChart = dynamic(
  () => import('./FlowTrendChart').then((mod) => ({ default: mod.FlowTrendChart })),
  {
    loading: () => (
      <div className="bg-muted flex h-96 w-full animate-pulse items-center justify-center rounded-lg">
        <LoadingSpinner message="Cargando gráfico..." />
      </div>
    ),
  }
);

const DashboardTaxEstimateSection = dynamic(
  () =>
    import('./DashboardTaxEstimateSection').then((mod) => ({
      default: mod.DashboardTaxEstimateSection,
    })),
  {
    loading: () => <div className="bg-muted h-64 w-full animate-pulse rounded-lg" />,
  }
);

const DashboardTaxEstimateCriticalBanner = dynamic(
  () =>
    import('./DashboardTaxEstimateCriticalBanner').then((mod) => ({
      default: mod.DashboardTaxEstimateCriticalBanner,
    })),
  { loading: () => null }
);

interface DashboardContentProps {
  profileId?: string;
  mes: number;
  año: number;
  regimenFiscal?: string;
}

export async function DashboardContent({
  profileId,
  mes,
  año,
  regimenFiscal,
}: DashboardContentProps) {
  const trendRangePromise = getDashboardTrendMetricsRange(profileId, año, mes, regimenFiscal);

  const [trendRange, invoices, expenses, profiles, currentUser] = await Promise.all([
    trendRangePromise,
    getInvoices({ profileId, mes, año, regimen_fiscal: regimenFiscal, limit: 3 }),
    getExpenses({ profileId, mes, año, regimen_fiscal: regimenFiscal, limit: 3 }),
    getProfiles(),
    getCurrentUser(),
  ]);

  const trendData = buildTrendSeriesForView(trendRange.items, 'año-actual', año, mes);

  const monthItem = findMetricsItemForMonth(trendRange.items, mes, año);
  const metrics =
    monthItem !== undefined
      ? metricsByMonthItemToPeriodMetrics(monthItem)
      : await getMetrics(profileId, mes, año, regimenFiscal);

  const activeProfile = profileId ? (profiles.data.find((p) => p.id === profileId) ?? null) : null;
  const selectedCompanyName = profileId
    ? activeProfile?.nombre
    : profiles.data.length > 0
      ? 'Todas las empresas'
      : undefined;

  // Obtener el nombre del usuario para mostrar
  const userName = currentUser.user.nombre || currentUser.user.email.split('@')[0];

  return (
    <>
      <DashboardHeader
        profiles={profiles.data || []}
        selectedProfileId={profileId}
        selectedMonth={mes}
        selectedYear={año}
        selectedRegimenFiscal={regimenFiscal ?? 'all'}
        activeProfile={activeProfile}
        companyName={selectedCompanyName}
      />
      <main className="w-full min-w-0 flex-1 space-y-6 p-4 pt-60 md:p-6 md:pt-52 lg:p-8 lg:pt-40">
        {/* Trial Banner - Solo se muestra si el usuario está en trial */}
        <TrialBannerWrapper />

        <DashboardTaxEstimateCriticalBanner
          profileId={profileId}
          mes={mes}
          año={año}
          regimenFiscal={regimenFiscal}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <DashboardGreeting userName={userName} companyName={selectedCompanyName} />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ShareReportButton
              profileId={profileId}
              clientName={activeProfile?.nombre}
              mes={mes}
              año={año}
            />
            <ExportPDFButton profileId={profileId} mes={mes} año={año} />
          </div>
        </div>
        <MetricsCards metrics={metrics} profileId={profileId} mes={mes} año={año} />
        <DashboardTaxEstimateSection
          profileId={profileId}
          mes={mes}
          año={año}
          regimenFiscal={regimenFiscal}
          regimenesFiscales={activeProfile?.regimenes_fiscales}
        />
        <Suspense
          fallback={
            <div className="bg-muted flex h-96 w-full animate-pulse items-center justify-center rounded-lg">
              <LoadingSpinner message="Cargando gráfico..." />
            </div>
          }
        >
          <FlowTrendChart
            initialData={trendData}
            profileId={profileId}
            año={año}
            mes={mes}
            regimenFiscal={regimenFiscal}
          />
        </Suspense>
        <div className="grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
          <div className="min-w-0">
            <RecentInvoicesTable invoices={invoices.data} />
          </div>
          <div className="min-w-0">
            <RecentExpensesTable expenses={expenses.data} />
          </div>
        </div>
      </main>
    </>
  );
}
