'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { getProfilesClient } from '@/lib/api/profiles.client';
import { getExpensesClient } from '@/lib/api/expenses.client';
import { getMetricsClient } from '@/lib/api/invoices.client';
import { useSubscription } from '@/lib/hooks/useSubscription';
import type { GetExpensesResponse } from '@/lib/types/expenses';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';
import { ExpensesListContent } from './ExpensesListContent';

interface NormalizedExpenseParams {
  profileId?: string;
  mes: number;
  año: number;
  categoria?: string;
  page: number;
  search?: string;
}

function getDefaultMes(): number {
  return new Date().getMonth() + 1;
}

function getDefaultAño(): number {
  return new Date().getFullYear();
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
    const categoriaParam = searchParams.get('categoria');

    return {
      profileId: profileIdParam && profileIdParam !== 'all' ? profileIdParam : undefined,
      mes: toNumber(searchParams.get('mes'), getDefaultMes()),
      año: toNumber(searchParams.get('año'), getDefaultAño()),
      categoria: categoriaParam && categoriaParam !== 'all' ? categoriaParam : undefined,
      page: toNumber(searchParams.get('page'), 1),
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
      normalizedParams.categoria ?? null,
      normalizedParams.page,
      normalizedParams.search ?? null,
    ],
    queryFn: () =>
      getExpensesClient({
        profileId: normalizedParams.profileId,
        mes: normalizedParams.mes,
        año: normalizedParams.año,
        categoria: normalizedParams.categoria,
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

  const fatalError = profilesQuery.error ?? expensesQuery.error ?? metricsQuery.error;
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

  const isUpdating = !isInitialLoading && (expensesQuery.isFetching || metricsQuery.isFetching);

  const tableState = isInitialLoading ? 'loading' : isUpdating ? 'updating' : 'idle';

  return (
    <ExpensesListContent
      expenses={expenses}
      pagination={pagination}
      profiles={profiles}
      subscription={subscription}
      expensesUsed={expensesUsed}
      initialProfileId={normalizedParams.profileId}
      initialMes={normalizedParams.mes}
      initialAño={normalizedParams.año}
      initialCategoria={normalizedParams.categoria ?? 'all'}
      initialSearch={normalizedParams.search}
      tableState={tableState}
    />
  );
}
