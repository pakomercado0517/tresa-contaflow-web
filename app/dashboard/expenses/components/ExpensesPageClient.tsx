'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import { getExpensesClient } from '@/lib/api/expenses.client';
import { getAccruedExpensesClient } from '@/lib/api/accrued-expenses.client';
import { getMetricsClient } from '@/lib/api/invoices.client';
import {
  listPaymentComplementsClient,
  profileIdToSnakeQuery,
} from '@/lib/api/payment-complements.client';
import { resolveDashboardListFilters } from '@/lib/navigation/resolve-dashboard-list-filters';
import { useDashboardFiltersUrlRestoreRef } from '@/lib/navigation/use-dashboard-filters-url-restore-ref';
import { useSubscription } from '@/lib/hooks/useSubscription';
import type { GetExpensesResponse, GetAccruedExpensesResponse } from '@/lib/types/expenses';
import type { ListPaymentComplementsResponse } from '@/lib/types/payment-complements';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';
import { ExpensesListContent } from './ExpensesListContent';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getPeriodIdFromMetrics(
  profileId: string | undefined,
  periodIdFromApi: string | undefined
): string | null {
  if (!profileId || !periodIdFromApi || periodIdFromApi === 'aggregated') return null;
  return UUID_REGEX.test(periodIdFromApi) ? periodIdFromApi : null;
}

export function ExpensesPageClient() {
  const searchParams = useSearchParams();
  const { subscription } = useSubscription();

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

  const dashboardFiltersUrlRestoreRef = useDashboardFiltersUrlRestoreRef(
    '/dashboard/expenses',
    profiles
  );

  const filters = resolved?.filters;
  const canFetchData = Boolean(filtersReady && resolved);
  const canShowList = Boolean(canFetchData && resolved?.canonicalSearch === null);

  const {
    data: expensesData,
    error: expensesError,
    isLoading: isExpensesLoading,
    isFetching: isExpensesFetching,
  } = useQuery<GetExpensesResponse, Error>({
    queryKey: [
      'expenses',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.regimen_fiscal ?? null,
      filters?.page ?? null,
      filters?.search ?? null,
    ],
    queryFn: () =>
      getExpensesClient({
        profileId: filters!.profileId,
        mes: filters!.mes,
        año: filters!.año,
        regimen_fiscal: filters!.regimen_fiscal,
        page: filters!.page,
        limit: 10,
        search: filters!.search,
      }),
    enabled: canFetchData,
    placeholderData: keepPreviousData,
  });

  const {
    data: metricsData,
    error: metricsError,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
  } = useQuery<PeriodMetricsResponse, Error>({
    queryKey: [
      'invoice-metrics',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.regimen_fiscal ?? null,
    ],
    queryFn: () =>
      getMetricsClient(
        filters!.profileId,
        filters!.mes,
        filters!.año,
        filters!.regimen_fiscal
      ),
    enabled: canFetchData,
    placeholderData: keepPreviousData,
  });

  const periodId = useMemo(
    () => getPeriodIdFromMetrics(filters?.profileId, metricsData?.period?.id),
    [filters?.profileId, metricsData?.period?.id]
  );

  const {
    data: accruedExpensesData,
    error: accruedExpensesError,
    isPending: isAccruedExpensesPending,
    isFetching: isAccruedExpensesFetching,
  } = useQuery<GetAccruedExpensesResponse, Error>({
    queryKey: ['accrued-expenses', periodId],
    queryFn: () => getAccruedExpensesClient(periodId as string),
    enabled: canFetchData && Boolean(periodId),
    placeholderData: keepPreviousData,
  });

  const {
    data: paymentComplementsData,
    error: paymentComplementsQueryError,
    isPending: isPaymentComplementsPending,
    isError: isPaymentComplementsError,
    isFetching: isPaymentComplementsFetching,
  } = useQuery<ListPaymentComplementsResponse, Error>({
    queryKey: [
      'payment-complements',
      'EGRESO',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.complementPage ?? null,
    ],
    queryFn: () =>
      listPaymentComplementsClient({
        role: 'EGRESO',
        profile_id: profileIdToSnakeQuery(filters!.profileId),
        mes: filters!.mes,
        año: filters!.año,
        page: filters!.complementPage,
        limit: 50,
      }),
    enabled: canFetchData,
    placeholderData: keepPreviousData,
  });

  const fatalError =
    profilesError ??
    (canFetchData
      ? expensesError ?? metricsError ?? (periodId ? accruedExpensesError : null)
      : null);

  if (fatalError) {
    return (
      <ErrorState
        title="Error al cargar los gastos"
        message={
          fatalError.message ||
          'No se pudieron cargar los gastos. Por favor verifica tu conexión e intenta nuevamente.'
        }
      />
    );
  }

  if (!canShowList || !filters) {
    return (
      <div className="flex min-h-50 items-center justify-center p-8">
        {filtersReady ? (
          <div ref={dashboardFiltersUrlRestoreRef} className="hidden" aria-hidden />
        ) : null}
        <LoadingSpinner message="Cargando gastos..." />
      </div>
    );
  }

  const expenses = expensesData?.data ?? [];
  const pagination =
    expensesData?.pagination ??
    ({ total: 0, page: filters.page, limit: 10, totalPages: 1 } as const);

  const expensesUsed = expensesData?.pagination?.total ?? 0;

  const isInitialLoading =
    (isProfilesLoading && !profilesData) ||
    (isExpensesLoading && !expensesData) ||
    (isMetricsLoading && !metricsData);

  const isUpdating =
    !isInitialLoading &&
    (isExpensesFetching || isMetricsFetching || isAccruedExpensesFetching);

  const tableState = isInitialLoading ? 'loading' : isUpdating ? 'updating' : 'idle';

  const manualExpenses = accruedExpensesData?.data ?? [];
  const manualExpenseDisabledReason =
    !filters.profileId ? 'no_profile' : !periodId ? 'no_period' : null;

  const paymentComplements = paymentComplementsData?.data ?? [];
  const paymentComplementsPagination =
    paymentComplementsData?.pagination ??
    ({
      total: 0,
      page: filters.complementPage,
      limit: 50,
      totalPages: 1,
    } as const);

  const paymentComplementsState = isPaymentComplementsPending && !paymentComplementsData
    ? 'loading'
    : isPaymentComplementsError
      ? 'error'
      : isPaymentComplementsFetching
        ? 'updating'
        : 'idle';

  const totalExpensesAmount = metricsData?.devengado.egresos_devengados ?? 0;
  const imp = metricsData?.impuestos;
  const totalTaxesAndWithholdings =
    (imp?.iva_acreditable?.devengado ?? imp?.iva_acreditable?.pagado ?? 0) +
    (imp?.retenciones_iva?.devengado ?? imp?.retenciones_iva?.cobrado ?? 0) +
    (imp?.retenciones_isr?.devengado ?? imp?.retenciones_isr?.cobrado ?? 0);

  return (
    <ExpensesListContent
      expenses={expenses}
      pagination={pagination}
      profiles={profiles}
      manualExpenses={manualExpenses}
      manualExpensesState={
        periodId
          ? isAccruedExpensesPending && !accruedExpensesData
            ? 'loading'
            : isAccruedExpensesFetching
              ? 'updating'
              : 'idle'
          : 'disabled'
      }
      manualExpenseDisabledReason={manualExpenseDisabledReason}
      periodId={periodId}
      profileId={filters.profileId}
      totalExpensesAmount={totalExpensesAmount}
      totalTaxesAndWithholdings={totalTaxesAndWithholdings}
      subscription={subscription}
      expensesUsed={expensesUsed}
      initialProfileId={filters.profileId}
      initialMes={filters.mes}
      initialAño={filters.año}
      initialRegimenFiscal={filters.regimen_fiscal}
      initialSearch={filters.search}
      tableState={tableState}
      paymentComplements={paymentComplements}
      paymentComplementsPagination={paymentComplementsPagination}
      paymentComplementsState={paymentComplementsState}
      paymentComplementsError={paymentComplementsQueryError?.message}
      complementPage={filters.complementPage}
    />
  );
}
