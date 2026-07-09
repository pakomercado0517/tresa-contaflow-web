'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getInvoicesClient, getMetricsClient } from '@/lib/api/invoices.client';
import { getManualIncomesClient } from '@/lib/api/manual-incomes.client';
import {
  listPaymentComplementsClient,
  profileIdToSnakeQuery,
} from '@/lib/api/payment-complements.client';
import { resolveDashboardListFilters } from '@/lib/navigation/resolve-dashboard-list-filters';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import type { GetInvoicesResponse } from '@/lib/types/invoices';
import type { ListPaymentComplementsResponse } from '@/lib/types/payment-complements';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';
import type { GetManualIncomesResponse } from '@/lib/types/manual-incomes';
import { InvoicesListContent } from './InvoicesListContent';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getPeriodIdFromMetrics(
  profileId: string | undefined,
  periodIdFromApi: string | undefined
): string | null {
  if (!profileId || !periodIdFromApi || periodIdFromApi === 'aggregated') return null;
  return UUID_REGEX.test(periodIdFromApi) ? periodIdFromApi : null;
}

export function InvoicesPageClient() {
  const router = useRouter();
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

  useEffect(() => {
    if (!resolved?.canonicalSearch) return;
    router.replace(`/dashboard/invoices?${resolved.canonicalSearch}`, { scroll: false });
  }, [resolved?.canonicalSearch, router]);

  const filters = resolved?.filters;
  const canFetchData = Boolean(filtersReady && resolved);
  const canShowList = Boolean(canFetchData && resolved?.canonicalSearch === null);

  const {
    data: invoicesData,
    error: invoicesError,
    isLoading: isInvoicesLoading,
    isFetching: isInvoicesFetching,
  } = useQuery<GetInvoicesResponse, Error>({
    queryKey: [
      'invoices',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.regimen_fiscal ?? null,
      filters?.page ?? null,
      filters?.search ?? null,
    ],
    queryFn: () =>
      getInvoicesClient({
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
    data: manualIncomesData,
    error: manualIncomesError,
    isPending: isManualIncomesPending,
    isFetching: isManualIncomesFetching,
  } = useQuery<GetManualIncomesResponse, Error>({
    queryKey: ['manual-incomes', periodId],
    queryFn: () => getManualIncomesClient(periodId as string),
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
      'INGRESO',
      filters?.profileId ?? null,
      filters?.mes ?? null,
      filters?.año ?? null,
      filters?.complementPage ?? null,
    ],
    queryFn: () =>
      listPaymentComplementsClient({
        role: 'INGRESO',
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
    (canFetchData ? invoicesError ?? metricsError ?? (periodId ? manualIncomesError : null) : null);

  if (fatalError) {
    return (
      <ErrorState
        title="Error al cargar las facturas"
        message={
          fatalError.message ||
          'No se pudieron cargar las facturas. Por favor verifica tu conexión e intenta nuevamente.'
        }
      />
    );
  }

  if (!canShowList || !filters) {
    return (
      <div className="flex min-h-50 items-center justify-center p-8">
        <LoadingSpinner message="Cargando facturas..." />
      </div>
    );
  }

  const invoices = invoicesData?.data ?? [];
  const pagination =
    invoicesData?.pagination ??
    ({ total: 0, page: filters.page, limit: 10, totalPages: 1 } as const);
  const periodMetrics = metricsData;
  const facturasPendientesPago =
    invoices.filter((inv) => inv.estadoPago?.estado !== 'PAGADO').length;
  const metrics = {
    totalFacturado: periodMetrics?.devengado.ingresos_devengados ?? 0,
    totalFacturas: pagination.total,
    facturasPendientesPago,
    facturasPUE: 0,
    facturasPPD: 0,
  };

  const isInitialLoading =
    (isProfilesLoading && !profilesData) ||
    (isInvoicesLoading && !invoicesData) ||
    (isMetricsLoading && !metricsData);

  const isUpdating = !isInitialLoading && (isInvoicesFetching || isMetricsFetching);

  const tableState = isInitialLoading ? 'loading' : isUpdating ? 'updating' : 'idle';

  const manualIncomes = manualIncomesData?.data ?? [];
  const manualIncomeDisabledReason =
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

  return (
    <InvoicesListContent
      invoices={invoices}
      pagination={pagination}
      profiles={profiles}
      manualIncomes={manualIncomes}
      manualIncomesState={
        periodId
          ? isManualIncomesPending && !manualIncomesData
            ? 'loading'
            : isManualIncomesFetching
              ? 'updating'
              : 'idle'
          : 'disabled'
      }
      manualIncomeDisabledReason={manualIncomeDisabledReason}
      periodId={periodId}
      profileId={filters.profileId}
      metrics={{
        totalFacturado: metrics.totalFacturado,
        totalFacturas: metrics.totalFacturas,
        facturasPendientesPago: metrics.facturasPendientesPago,
        facturasPUE: metrics.facturasPUE,
        facturasPPD: metrics.facturasPPD,
      }}
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
