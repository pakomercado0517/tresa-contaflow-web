'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getExpensesClient } from '@/lib/api/expenses.client';
import { getInvoicesClient, getMetricsClient } from '@/lib/api/invoices.client';
import {
  getDashboardHomeReplaceSearch,
  resolveDashboardListFilters,
} from '@/lib/navigation/resolve-dashboard-list-filters';
import { useDashboardHomeFiltersUrlRestoreRef } from '@/lib/navigation/use-dashboard-home-filters-url-restore-ref';
import { dashboardHeavyQueryOptions } from '@/lib/query/dashboard-home-query';
import {
  getCurrentUserDisplayName,
  useHydratedCurrentUser,
} from '@/lib/query/current-user-query';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import type { GetExpensesResponse } from '@/lib/types/expenses';
import type { GetInvoicesResponse } from '@/lib/types/invoices';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';
import { DashboardHomeView } from './DashboardHomeView';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSelectProfilePrompt } from './DashboardSelectProfilePrompt';

export function DashboardHomePageClient() {
  const searchParams = useSearchParams();

  const {
    data: profilesData,
    error: profilesError,
  } = useQuery<GetProfilesResponse, Error>(profilesQueryOptions());

  const filtersReady = profilesData !== undefined;
  const profiles = useMemo(() => profilesData?.data ?? [], [profilesData]);

  const resolved = useMemo(() => {
    if (!filtersReady) return null;
    return resolveDashboardListFilters(searchParams, profiles);
  }, [filtersReady, searchParams, profiles]);

  const replaceSearch = useMemo(() => {
    if (!filtersReady) return null;
    return getDashboardHomeReplaceSearch(searchParams, profiles);
  }, [filtersReady, searchParams, profiles]);

  const dashboardHomeFiltersUrlRestoreRef = useDashboardHomeFiltersUrlRestoreRef(
    '/dashboard',
    profiles
  );

  const filters = resolved?.filters;
  const filtersSynced = Boolean(filtersReady && resolved && replaceSearch === null);
  const hasSelectedProfile = Boolean(filters?.profileId);
  const canFetchData = filtersSynced && hasSelectedProfile;

  const {
    data: metrics,
    error: metricsError,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
  } = useQuery<PeriodMetricsResponse, Error>({
    queryKey: [
      'dashboard-home',
      'metrics-month',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.regimen_fiscal ?? null,
    ],
    queryFn: () =>
      getMetricsClient(filters!.profileId, filters!.mes, filters!.año, filters!.regimen_fiscal),
    enabled: canFetchData,
    placeholderData: keepPreviousData,
    ...dashboardHeavyQueryOptions,
  });

  const {
    data: invoicesData,
    error: invoicesError,
    isLoading: isInvoicesLoading,
    isFetching: isInvoicesFetching,
  } = useQuery<GetInvoicesResponse, Error>({
    queryKey: [
      'dashboard-home',
      'invoices-preview',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.regimen_fiscal ?? null,
    ],
    queryFn: () =>
      getInvoicesClient({
        profileId: filters!.profileId,
        mes: filters!.mes,
        año: filters!.año,
        regimen_fiscal: filters!.regimen_fiscal,
        limit: 3,
      }),
    enabled: canFetchData,
    placeholderData: keepPreviousData,
    ...dashboardHeavyQueryOptions,
  });

  const {
    data: expensesData,
    error: expensesError,
    isLoading: isExpensesLoading,
    isFetching: isExpensesFetching,
  } = useQuery<GetExpensesResponse, Error>({
    queryKey: [
      'dashboard-home',
      'expenses-preview',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.regimen_fiscal ?? null,
    ],
    queryFn: () =>
      getExpensesClient({
        profileId: filters!.profileId,
        mes: filters!.mes,
        año: filters!.año,
        regimen_fiscal: filters!.regimen_fiscal,
        limit: 3,
      }),
    enabled: canFetchData,
    placeholderData: keepPreviousData,
    ...dashboardHeavyQueryOptions,
  });

  const currentUserData = useHydratedCurrentUser();

  const isContentUpdating =
    (isMetricsFetching && !isMetricsLoading) ||
    (isInvoicesFetching && !isInvoicesLoading) ||
    (isExpensesFetching && !isExpensesLoading);

  const isFiltersLoading = !filtersReady || (filtersReady && replaceSearch !== null);
  const isKpisInitialLoading = canFetchData && isMetricsLoading && metrics === undefined;

  const fatalError =
    profilesError ??
    (canFetchData ? metricsError ?? invoicesError ?? expensesError : null);

  if (fatalError) {
    return (
      <ErrorState
        title="Error al cargar el dashboard"
        message={
          fatalError.message ||
          'No se pudo cargar el resumen. Por favor verifica tu conexión e intenta nuevamente.'
        }
      />
    );
  }

  if (filtersSynced && !hasSelectedProfile && filters) {
    return (
      <>
        <DashboardHeader
          selectedProfileId={filters.profileId}
          selectedMonth={filters.mes}
          selectedYear={filters.año}
          selectedRegimenFiscal={filters.regimen_fiscal ?? 'all'}
        />
        <main className="w-full min-w-0 flex-1 space-y-6 p-4 pt-72 md:p-6 md:pt-52 lg:p-8 lg:pt-40">
          <DashboardSelectProfilePrompt hasProfiles={profiles.length > 0} />
        </main>
      </>
    );
  }

  if (isFiltersLoading || isKpisInitialLoading || !filters?.profileId) {
    return (
      <div className="flex min-h-50 items-center justify-center p-8">
        {filtersReady ? (
          <div ref={dashboardHomeFiltersUrlRestoreRef} className="hidden" aria-hidden />
        ) : null}
        <LoadingSpinner message="Cargando resumen..." />
      </div>
    );
  }

  const userName = getCurrentUserDisplayName(currentUserData);

  return (
    <>
      {filtersReady ? (
        <div ref={dashboardHomeFiltersUrlRestoreRef} className="hidden" aria-hidden />
      ) : null}
      <DashboardHomeView
        profileId={filters.profileId}
        mes={filters.mes}
        año={filters.año}
        regimenFiscal={filters.regimen_fiscal}
        metrics={metrics}
        isContentUpdating={isContentUpdating}
        invoices={invoicesData?.data}
        isInvoicesLoading={isInvoicesLoading}
        expenses={expensesData?.data}
        isExpensesLoading={isExpensesLoading}
        userName={userName}
      />
    </>
  );
}
