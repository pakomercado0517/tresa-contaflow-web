'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { getProfilesClient } from '@/lib/api/profiles.client';
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

  const profilesQuery = useQuery<GetProfilesResponse, Error>({
    queryKey: ['profiles'],
    queryFn: () => getProfilesClient(),
    staleTime: 60_000,
  });

  const expensesQuery = useQuery<GetExpensesResponse, Error>({
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

  const metricsQuery = useQuery<PeriodMetricsResponse, Error>({
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
    () => getPeriodIdFromMetrics(normalizedParams.profileId, metricsQuery.data?.period?.id),
    [normalizedParams.profileId, metricsQuery.data?.period?.id]
  );

  const accruedExpensesQuery = useQuery<GetAccruedExpensesResponse, Error>({
    queryKey: ['accrued-expenses', periodId],
    queryFn: () => getAccruedExpensesClient(periodId as string),
    enabled: !!periodId,
    placeholderData: keepPreviousData,
  });

  const paymentComplementsQuery = useQuery<ListPaymentComplementsResponse, Error>({
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
    profilesQuery.error ??
    expensesQuery.error ??
    metricsQuery.error ??
    (periodId ? accruedExpensesQuery.error : null);
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

  const expenses = expensesQuery.data?.data ?? [];
  const pagination =
    expensesQuery.data?.pagination ??
    ({ total: 0, page: normalizedParams.page, limit: 10, totalPages: 1 } as const);
  const profiles = profilesQuery.data?.data ?? [];

  const expensesUsed = expensesQuery.data?.pagination?.total ?? 0;

  const isInitialLoading =
    (profilesQuery.isLoading && !profilesQuery.data) ||
    (expensesQuery.isLoading && !expensesQuery.data) ||
    (metricsQuery.isLoading && !metricsQuery.data);

  const isUpdating =
    !isInitialLoading &&
    (expensesQuery.isFetching || metricsQuery.isFetching || accruedExpensesQuery.isFetching);

  const tableState = isInitialLoading ? 'loading' : isUpdating ? 'updating' : 'idle';

  const manualExpenses = accruedExpensesQuery.data?.data ?? [];
  const manualExpenseDisabledReason =
    !normalizedParams.profileId ? 'no_profile' : !periodId ? 'no_period' : null;

  const paymentComplements = paymentComplementsQuery.data?.data ?? [];
  const paymentComplementsPagination =
    paymentComplementsQuery.data?.pagination ??
    ({
      total: 0,
      page: normalizedParams.complementPage,
      limit: 50,
      totalPages: 1,
    } as const);

  const paymentComplementsState = paymentComplementsQuery.isPending && !paymentComplementsQuery.data
    ? 'loading'
    : paymentComplementsQuery.isError
      ? 'error'
      : paymentComplementsQuery.isFetching
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
          ? accruedExpensesQuery.isPending && !accruedExpensesQuery.data
            ? 'loading'
            : accruedExpensesQuery.isFetching
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
      paymentComplementsError={paymentComplementsQuery.error?.message}
      complementPage={normalizedParams.complementPage}
    />
  );
}
