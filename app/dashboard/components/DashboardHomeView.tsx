'use client';

import dynamic from 'next/dynamic';
import { DashboardHeader } from './DashboardHeader';
import { MetricsCards } from './MetricsCards';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { RecentExpensesTable } from './RecentExpensesTable';
import { RecentTableSkeleton } from './RecentTableSkeleton';
import { TrialBannerWrapper } from './TrialBannerWrapper';
import { DashboardHomeIntro } from './DashboardHomeIntro';
import type { Invoice } from '@/lib/types/invoices';
import type { Expense } from '@/lib/types/expenses';
import { DEFAULT_PERIOD_METRICS, type PeriodMetricsResponse } from '@/lib/types/metrics';

const FlowTrendChart = dynamic(
  () => import('./FlowTrendChart').then((mod) => ({ default: mod.FlowTrendChart })),
  {
    loading: () => (
      <div className="bg-muted border-border h-96 w-full animate-pulse rounded-lg border" />
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

export interface DashboardHomeViewProps {
  profileId: string;
  mes: number;
  año: number;
  regimenFiscal?: string;
  metrics?: PeriodMetricsResponse;
  isMetricsFetching?: boolean;
  invoices?: Invoice[];
  isInvoicesLoading?: boolean;
  expenses?: Expense[];
  isExpensesLoading?: boolean;
  userName: string;
}

export function DashboardHomeView({
  profileId,
  mes,
  año,
  regimenFiscal,
  metrics,
  isMetricsFetching = false,
  invoices,
  isInvoicesLoading = false,
  expenses,
  isExpensesLoading = false,
  userName,
}: DashboardHomeViewProps) {
  const displayMetrics = metrics ?? DEFAULT_PERIOD_METRICS;

  return (
    <>
      <DashboardHeader
        selectedProfileId={profileId}
        selectedMonth={mes}
        selectedYear={año}
        selectedRegimenFiscal={regimenFiscal ?? 'all'}
      />
      <main className="w-full min-w-0 flex-1 space-y-6 p-4 pt-72 md:p-6 md:pt-52 lg:p-8 lg:pt-40">
        <TrialBannerWrapper />

        <DashboardTaxEstimateCriticalBanner
          profileId={profileId}
          mes={mes}
          año={año}
          regimenFiscal={regimenFiscal}
        />

        <DashboardHomeIntro userName={userName} profileId={profileId} mes={mes} año={año} />

        <div className={isMetricsFetching ? 'opacity-80 transition-opacity duration-300' : undefined}>
          <MetricsCards metrics={displayMetrics} profileId={profileId} mes={mes} año={año} />
        </div>

        <FlowTrendChart profileId={profileId} año={año} mes={mes} regimenFiscal={regimenFiscal} />

        <div className="grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
          <div className="min-w-0">
            {isInvoicesLoading && !invoices ? (
              <RecentTableSkeleton title="Últimos Ingresos" />
            ) : (
              <RecentInvoicesTable invoices={invoices ?? []} />
            )}
          </div>
          <div className="min-w-0">
            {isExpensesLoading && !expenses ? (
              <RecentTableSkeleton title="Últimos Gastos" />
            ) : (
              <RecentExpensesTable expenses={expenses ?? []} />
            )}
          </div>
        </div>

        <DashboardTaxEstimateSection
          profileId={profileId}
          mes={mes}
          año={año}
          regimenFiscal={regimenFiscal}
        />
      </main>
    </>
  );
}
