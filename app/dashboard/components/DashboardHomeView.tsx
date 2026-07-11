'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardHeader } from './DashboardHeader';
import { MetricsCards } from './MetricsCards';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { RecentExpensesTable } from './RecentExpensesTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TrialBannerWrapper } from './TrialBannerWrapper';
import { DashboardHomeIntro } from './DashboardHomeIntro';
import type { TrendDataPoint } from '@/lib/api/invoices.client';
import type { Invoice } from '@/lib/types/invoices';
import type { Expense } from '@/lib/types/expenses';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';

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

export interface DashboardHomeViewProps {
  profileId?: string;
  mes: number;
  año: number;
  regimenFiscal?: string;
  metrics: PeriodMetricsResponse;
  trendData: TrendDataPoint[];
  invoices: Invoice[];
  expenses: Expense[];
  userName: string;
}

export function DashboardHomeView({
  profileId,
  mes,
  año,
  regimenFiscal,
  metrics,
  trendData,
  invoices,
  expenses,
  userName,
}: DashboardHomeViewProps) {
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
        <MetricsCards metrics={metrics} profileId={profileId} mes={mes} año={año} />
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
            <RecentInvoicesTable invoices={invoices} />
          </div>
          <div className="min-w-0">
            <RecentExpensesTable expenses={expenses} />
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
