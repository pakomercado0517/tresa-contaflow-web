import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardHeader } from './DashboardHeader';
import { MetricsCards } from './MetricsCards';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { RecentExpensesTable } from './RecentExpensesTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TrialBannerWrapper } from './TrialBannerWrapper';
import { DashboardHomeIntro } from './DashboardHomeIntro';
import { getMetrics, getInvoices, getDashboardTrendMetricsRange } from '@/lib/api/invoices';
import { getExpenses } from '@/lib/api/expenses';
import { getCurrentUser } from '@/lib/api/auth.server';
import {
  buildTrendSeriesForView,
  findMetricsItemForMonth,
} from '@/lib/utils/metrics-trend-range';
import { metricsByMonthItemToPeriodMetrics } from '@/lib/types/metrics';

// Lazy load componentes pesados (jsPDF y Recharts)
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

  const [trendRange, invoices, expenses, currentUser] = await Promise.all([
    trendRangePromise,
    getInvoices({ profileId, mes, año, regimen_fiscal: regimenFiscal, limit: 3 }),
    getExpenses({ profileId, mes, año, regimen_fiscal: regimenFiscal, limit: 3 }),
    getCurrentUser(),
  ]);

  const trendData = buildTrendSeriesForView(trendRange.items, 'año-actual', año, mes);

  const monthItem = findMetricsItemForMonth(trendRange.items, mes, año);
  const metrics =
    monthItem !== undefined
      ? metricsByMonthItemToPeriodMetrics(monthItem)
      : await getMetrics(profileId, mes, año, regimenFiscal);

  const userName = currentUser.user.nombre || currentUser.user.email.split('@')[0];

  return (
    <>
      <DashboardHeader
        selectedProfileId={profileId}
        selectedMonth={mes}
        selectedYear={año}
        selectedRegimenFiscal={regimenFiscal ?? 'all'}
      />
      <main className="w-full min-w-0 flex-1 space-y-6 p-4 pt-60 md:p-6 md:pt-52 lg:p-8 lg:pt-40">
        <TrialBannerWrapper />

        <DashboardTaxEstimateCriticalBanner
          profileId={profileId}
          mes={mes}
          año={año}
          regimenFiscal={regimenFiscal}
        />

        <DashboardHomeIntro userName={userName} profileId={profileId} mes={mes} año={año} />
        <MetricsCards metrics={metrics} profileId={profileId} mes={mes} año={año} />
        <DashboardTaxEstimateSection
          profileId={profileId}
          mes={mes}
          año={año}
          regimenFiscal={regimenFiscal}
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
