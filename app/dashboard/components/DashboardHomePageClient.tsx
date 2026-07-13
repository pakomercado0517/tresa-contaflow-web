'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getExpensesClient } from '@/lib/api/expenses.client';
import { getInvoicesClient, getMetricsClient, getMetricsRangeClient } from '@/lib/api/invoices.client';
import {
  getDashboardHomeReplaceSearch,
  resolveDashboardListFilters,
} from '@/lib/navigation/resolve-dashboard-list-filters';
import { useDashboardHomeFiltersUrlRestoreRef } from '@/lib/navigation/use-dashboard-home-filters-url-restore-ref';
import { currentUserQueryOptions } from '@/lib/query/current-user-query';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import type { GetExpensesResponse } from '@/lib/types/expenses';
import type { GetInvoicesResponse } from '@/lib/types/invoices';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { GetCurrentUserResponse } from '@/lib/types/auth';
import {
  metricsByMonthItemToPeriodMetrics,
  DEFAULT_PERIOD_METRICS,
  type MetricsRangeResponse,
  type PeriodMetricsResponse,
} from '@/lib/types/metrics';
import {
  buildTrendSeriesForView,
  findMetricsItemForMonth,
  getTrendRangeBounds,
} from '@/lib/utils/metrics-trend-range';
import { DashboardHomeView } from './DashboardHomeView';

export function DashboardHomePageClient() {
  const searchParams = useSearchParams();

  const {
    data: profilesData,
    error: profilesError,
    isLoading: isProfilesLoading,
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
  const canFetchData = Boolean(filtersReady && resolved && replaceSearch === null);

  const {
    data: trendRangeData,
    error: trendRangeError,
    isLoading: isTrendRangeLoading,
  } = useQuery<MetricsRangeResponse, Error>({
    queryKey: [
      'dashboard-home',
      'metrics-range',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.regimen_fiscal ?? null,
    ],
    queryFn: async () => {
      const bounds = getTrendRangeBounds('año-actual', filters!.año, filters!.mes);
      return getMetricsRangeClient({
        ...bounds,
        profileId: filters!.profileId,
        regimenFiscal: filters!.regimen_fiscal,
      });
    },
    enabled: canFetchData,
    placeholderData: keepPreviousData,
  });

  const monthItem = useMemo(() => {
    const resolvedFilters = resolved?.filters;
    return trendRangeData && resolvedFilters
      ? findMetricsItemForMonth(trendRangeData.items, resolvedFilters.mes, resolvedFilters.año)
      : undefined;
  }, [trendRangeData, resolved]);

  const needsMetricsFallback = canFetchData && trendRangeData !== undefined && monthItem === undefined;

  const {
    data: fallbackMetrics,
    error: fallbackMetricsError,
    isLoading: isFallbackMetricsLoading,
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
    enabled: needsMetricsFallback,
  });

  const metrics: PeriodMetricsResponse | undefined = useMemo(() => {
    const resolvedFilters = resolved?.filters;
    if (!resolvedFilters || !trendRangeData) return undefined;
    if (monthItem !== undefined) {
      return metricsByMonthItemToPeriodMetrics(monthItem);
    }
    return fallbackMetrics;
  }, [resolved, trendRangeData, monthItem, fallbackMetrics]);

  const trendData = useMemo(() => {
    const resolvedFilters = resolved?.filters;
    if (!trendRangeData || !resolvedFilters) return [];
    return buildTrendSeriesForView(
      trendRangeData.items,
      'año-actual',
      resolvedFilters.año,
      resolvedFilters.mes
    );
  }, [trendRangeData, resolved]);

  const {
    data: invoicesData,
    error: invoicesError,
    isLoading: isInvoicesLoading,
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
  });

  const {
    data: expensesData,
    error: expensesError,
    isLoading: isExpensesLoading,
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
  });

  const {
    data: currentUserData,
    error: currentUserError,
    isLoading: isCurrentUserLoading,
  } = useQuery<GetCurrentUserResponse, Error>({
    ...currentUserQueryOptions(),
    enabled: canFetchData,
  });

  const metricsReady =
    trendRangeData !== undefined &&
    (monthItem !== undefined || fallbackMetrics !== undefined);

  const isInitialLoading =
    !canFetchData ||
    (isProfilesLoading && !profilesData) ||
    (canFetchData &&
      ((isTrendRangeLoading && !trendRangeData) ||
        (needsMetricsFallback && isFallbackMetricsLoading && !fallbackMetrics) ||
        (isInvoicesLoading && !invoicesData) ||
        (isExpensesLoading && !expensesData) ||
        (isCurrentUserLoading && !currentUserData)));

  const fatalError =
    profilesError ??
    (canFetchData
      ? trendRangeError ??
        fallbackMetricsError ??
        invoicesError ??
        expensesError ??
        currentUserError
      : null);

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

  if (isInitialLoading || !filters || !metricsReady || !currentUserData) {
    return (
      <div className="flex min-h-50 items-center justify-center p-8">
        {filtersReady ? (
          <div ref={dashboardHomeFiltersUrlRestoreRef} className="hidden" aria-hidden />
        ) : null}
        <LoadingSpinner message="Cargando resumen..." />
      </div>
    );
  }

  const userName =
    currentUserData.user.nombre || currentUserData.user.email.split('@')[0];

  const displayMetrics = metrics ?? DEFAULT_PERIOD_METRICS;

  return (
    <DashboardHomeView
      profileId={filters.profileId}
      mes={filters.mes}
      año={filters.año}
      regimenFiscal={filters.regimen_fiscal}
      metrics={displayMetrics}
      trendData={trendData}
      invoices={invoicesData?.data ?? []}
      expenses={expensesData?.data ?? []}
      userName={userName}
    />
  );
}
