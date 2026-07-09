'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import { getExpensesClient } from '@/lib/api/expenses.client';
import { getAccruedExpensesClient } from '@/lib/api/accrued-expenses.client';
import { getMetricsClient } from '@/lib/api/invoices.client';
import {
  listPaymentComplementsClient,
  profileIdToSnakeQuery,
} from '@/lib/api/payment-complements.client';
import { useSubscription } from '@/lib/hooks/useSubscription';
import type { GetExpensesResponse, GetAccruedExpensesResponse } from '@/lib/types/expenses';
import type { ListPaymentComplementsResponse } from '@/lib/types/payment-complements';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';
import { ExpensesListContent } from './ExpensesListContent';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getPeriodIdFromMetrics(
  profileId: string | undefined,
  periodIdFromApi: string | undefined
): string | null {
  if (!profileId || !periodIdFromApi || periodIdFromApi === 'aggregated') return null;
  return UUID_REGEX.test(periodIdFromApi) ? periodIdFromApi : null;
}

interface NormalizedExpenseParams {
  profileId?: string;
  mes: number;
  año: number;
  regimen_fiscal?: string;
  page: number;
  complementPage: number;
  search?: string;
}

function getDefaultMes(): number {
  return getCurrentMonthYearInAppTimezone().mes;
}

function getDefaultAño(): number {
  return getCurrentMonthYearInAppTimezone().año;
}

function toNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function ExpensesPageClient() {
  const searchParams = useSearchParams();
  const { subscription } = useSubscription();

  const normalizedParams: NormalizedExpenseParams = useMemo(() => {
    const profileIdParam = searchParams.get('profileId');
    const regimenFiscalParam = searchParams.get('regimen_fiscal');

    return {
      profileId: profileIdParam && profileIdParam !== 'all' ? profileIdParam : undefined,
      mes: toNumber(searchParams.get('mes'), getDefaultMes()),
      año: toNumber(searchParams.get('año'), getDefaultAño()),
      regimen_fiscal: regimenFiscalParam && regimenFiscalParam !== 'all' ? regimenFiscalParam : undefined,
      page: toNumber(searchParams.get('page'), 1),
      complementPage: toNumber(searchParams.get('complementPage'), 1),
      search: searchParams.get('search') ?? undefined,
    };
  }, [searchParams]);

  const {
    data: profilesData,
    error: profilesError,
    isLoading: isProfilesLoading,
  } = useQuery<GetProfilesResponse, Error>(profilesQueryOptions());

  const {
    data: expensesData,
    error: expensesError,
    isLoading: isExpensesLoading,
    isFetching: isExpensesFetching,
  } = useQuery<GetExpensesResponse, Error>({
    queryKey: [
      'expenses',
      normalizedParams.profileId ?? null,
      normalizedParams.mes,
      normalizedParams.año,
      normalizedParams.regimen_fiscal ?? null,
      normalizedParams.page,
      normalizedParams.search ?? null,
    ],
    queryFn: () =>
      getExpensesClient({
        profileId: normalizedParams.profileId,
        mes: normalizedParams.mes,
        año: normalizedParams.año,
        regimen_fiscal: normalizedParams.regimen_fiscal,
        page: normalizedParams.page,
        limit: 10,
        search: normalizedParams.search,
      }),
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
      normalizedParams.profileId ?? null,
      normalizedParams.mes,
      normalizedParams.año,
    ],
    queryFn: () =>
      getMetricsClient(normalizedParams.profileId, normalizedParams.mes, normalizedParams.año),
    placeholderData: keepPreviousData,
  });

  const periodId = useMemo(
    () => getPeriodIdFromMetrics(normalizedParams.profileId, metricsData?.period?.id),
    [normalizedParams.profileId, metricsData?.period?.id]
  );

  const {
    data: accruedExpensesData,
    error: accruedExpensesError,
    isPending: isAccruedExpensesPending,
    isFetching: isAccruedExpensesFetching,
  } = useQuery<GetAccruedExpensesResponse, Error>({
    queryKey: ['accrued-expenses', periodId],
    queryFn: () => getAccruedExpensesClient(periodId as string),
    enabled: !!periodId,
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
      normalizedParams.profileId ?? null,
      normalizedParams.mes,
      normalizedParams.año,
      normalizedParams.complementPage,
    ],
    queryFn: () =>
      listPaymentComplementsClient({
        role: 'EGRESO',
        profile_id: profileIdToSnakeQuery(normalizedParams.profileId),
        mes: normalizedParams.mes,
        año: normalizedParams.año,
        page: normalizedParams.complementPage,
        limit: 50,
      }),
    placeholderData: keepPreviousData,
  });

  const fatalError =
    profilesError ??
    expensesError ??
    metricsError ??
    (periodId ? accruedExpensesError : null);
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

  const expenses = expensesData?.data ?? [];
  const pagination =
    expensesData?.pagination ??
    ({ total: 0, page: normalizedParams.page, limit: 10, totalPages: 1 } as const);
  const profiles = profilesData?.data ?? [];

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
    !normalizedParams.profileId ? 'no_profile' : !periodId ? 'no_period' : null;

  const paymentComplements = paymentComplementsData?.data ?? [];
  const paymentComplementsPagination =
    paymentComplementsData?.pagination ??
    ({
      total: 0,
      page: normalizedParams.complementPage,
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
      profileId={normalizedParams.profileId}
      subscription={subscription}
      expensesUsed={expensesUsed}
      initialProfileId={normalizedParams.profileId}
      initialMes={normalizedParams.mes}
      initialAño={normalizedParams.año}
      initialRegimenFiscal={normalizedParams.regimen_fiscal ?? 'all'}
      initialSearch={normalizedParams.search}
      tableState={tableState}
      paymentComplements={paymentComplements}
      paymentComplementsPagination={paymentComplementsPagination}
      paymentComplementsState={paymentComplementsState}
      paymentComplementsError={paymentComplementsQueryError?.message}
      complementPage={normalizedParams.complementPage}
    />
  );
}
