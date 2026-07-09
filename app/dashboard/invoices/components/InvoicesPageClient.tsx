'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { getInvoicesClient, getMetricsClient } from '@/lib/api/invoices.client';
import { getManualIncomesClient } from '@/lib/api/manual-incomes.client';
import {
  listPaymentComplementsClient,
  profileIdToSnakeQuery,
} from '@/lib/api/payment-complements.client';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import type { GetInvoicesResponse } from '@/lib/types/invoices';
import type { ListPaymentComplementsResponse } from '@/lib/types/payment-complements';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';
import type { GetManualIncomesResponse } from '@/lib/types/manual-incomes';
import { InvoicesListContent } from './InvoicesListContent';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * period_id se obtiene de GET /api/metrics (con profile_id, mes, año).
 * Si el backend devuelve period.id = "aggregated" no podemos listar/crear ingresos manuales.
 * Aceptamos cualquier id que sea UUID; si el backend devuelve otro formato, la API fallará al crear.
 */
function getPeriodIdFromMetrics(
  profileId: string | undefined,
  periodIdFromApi: string | undefined
): string | null {
  if (!profileId || !periodIdFromApi || periodIdFromApi === 'aggregated') return null;
  return UUID_REGEX.test(periodIdFromApi) ? periodIdFromApi : null;
}

interface NormalizedInvoiceParams {
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

export function InvoicesPageClient() {
  const searchParams = useSearchParams();

  const normalizedParams: NormalizedInvoiceParams = useMemo(() => {
    const profileIdParam = searchParams.get('profileId');
    const regimenParam = searchParams.get('regimen_fiscal');

    return {
      profileId: profileIdParam && profileIdParam !== 'all' ? profileIdParam : undefined,
      mes: toNumber(searchParams.get('mes'), getDefaultMes()),
      año: toNumber(searchParams.get('año'), getDefaultAño()),
      regimen_fiscal: regimenParam && regimenParam !== 'all' ? regimenParam : undefined,
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
    data: invoicesData,
    error: invoicesError,
    isLoading: isInvoicesLoading,
    isFetching: isInvoicesFetching,
  } = useQuery<GetInvoicesResponse, Error>({
    queryKey: [
      'invoices',
      normalizedParams.profileId ?? null,
      normalizedParams.mes,
      normalizedParams.año,
      normalizedParams.regimen_fiscal ?? null,
      normalizedParams.page,
      normalizedParams.search ?? null,
    ],
    queryFn: () =>
      getInvoicesClient({
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
    data: manualIncomesData,
    error: manualIncomesError,
    isPending: isManualIncomesPending,
    isFetching: isManualIncomesFetching,
  } = useQuery<GetManualIncomesResponse, Error>({
    queryKey: ['manual-incomes', periodId],
    queryFn: () => getManualIncomesClient(periodId as string),
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
      'INGRESO',
      normalizedParams.profileId ?? null,
      normalizedParams.mes,
      normalizedParams.año,
      normalizedParams.complementPage,
    ],
    queryFn: () =>
      listPaymentComplementsClient({
        role: 'INGRESO',
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
    invoicesError ??
    metricsError ??
    (periodId ? manualIncomesError : null);
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

  const invoices = invoicesData?.data ?? [];
  const pagination =
    invoicesData?.pagination ??
    ({ total: 0, page: normalizedParams.page, limit: 10, totalPages: 1 } as const);
  const profiles = profilesData?.data ?? [];
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
      profileId={normalizedParams.profileId}
      metrics={{
        totalFacturado: metrics.totalFacturado,
        totalFacturas: metrics.totalFacturas,
        facturasPendientesPago: metrics.facturasPendientesPago,
        facturasPUE: metrics.facturasPUE,
        facturasPPD: metrics.facturasPPD,
      }}
      initialProfileId={normalizedParams.profileId}
      initialMes={normalizedParams.mes}
      initialAño={normalizedParams.año}
      initialRegimenFiscal={normalizedParams.regimen_fiscal}
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
