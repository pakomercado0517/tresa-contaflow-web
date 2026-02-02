'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/common/ErrorState';
import { getProfilesClient } from '@/lib/api/profiles.client';
import { getInvoicesClient, getMetricsClient } from '@/lib/api/invoices.client';
import type { GetInvoicesResponse } from '@/lib/types/invoices';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { MetricsResponse } from '@/lib/types/invoices';
import { InvoicesListContent } from './InvoicesListContent';

interface NormalizedInvoiceParams {
  profileId?: string;
  mes: number;
  año: number;
  tipo?: string;
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

export function InvoicesPageClient() {
  const searchParams = useSearchParams();

  const normalizedParams: NormalizedInvoiceParams = useMemo(() => {
    const profileIdParam = searchParams.get('profileId');
    const tipoParam = searchParams.get('tipo');

    return {
      profileId: profileIdParam && profileIdParam !== 'all' ? profileIdParam : undefined,
      mes: toNumber(searchParams.get('mes'), getDefaultMes()),
      año: toNumber(searchParams.get('año'), getDefaultAño()),
      tipo: tipoParam && tipoParam !== 'all' ? tipoParam : undefined,
      page: toNumber(searchParams.get('page'), 1),
      search: searchParams.get('search') ?? undefined,
    };
  }, [searchParams]);

  const profilesQuery = useQuery<GetProfilesResponse, Error>({
    queryKey: ['profiles'],
    queryFn: () => getProfilesClient(),
    staleTime: 60_000,
  });

  const invoicesQuery = useQuery<GetInvoicesResponse, Error>({
    queryKey: [
      'invoices',
      normalizedParams.profileId ?? null,
      normalizedParams.mes,
      normalizedParams.año,
      normalizedParams.tipo ?? null,
      normalizedParams.page,
      normalizedParams.search ?? null,
    ],
    queryFn: () =>
      getInvoicesClient({
        profileId: normalizedParams.profileId,
        mes: normalizedParams.mes,
        año: normalizedParams.año,
        tipo: normalizedParams.tipo,
        page: normalizedParams.page,
        limit: 10,
        search: normalizedParams.search,
      }),
    placeholderData: keepPreviousData,
  });

  const metricsQuery = useQuery<MetricsResponse, Error>({
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

  const fatalError = profilesQuery.error ?? invoicesQuery.error ?? metricsQuery.error;
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

  const invoices = invoicesQuery.data?.data ?? [];
  const pagination =
    invoicesQuery.data?.pagination ??
    ({ total: 0, page: normalizedParams.page, limit: 10, totalPages: 1 } as const);
  const profiles = profilesQuery.data?.data ?? [];
  const metrics = metricsQuery.data?.metrics ?? {
    totalFacturado: 0,
    totalPagado: 0,
    totalCompras: 0,
    totalComprasPagadas: 0,
    totalPagadoMenosCompras: 0,
    pendientePagar: 0,
    gastosPendientes: 0,
    totalFacturas: 0,
    totalGastos: 0,
    facturasPUE: 0,
    facturasPPD: 0,
    facturasPagadasCompletamente: 0,
    facturasParcialmentePagadas: 0,
    facturasPendientesPago: 0,
    gastosPUE: 0,
    gastosPPD: 0,
    gastosPagadosCompletamente: 0,
    gastosParcialmentePagados: 0,
  };

  const isInitialLoading =
    (profilesQuery.isLoading && !profilesQuery.data) ||
    (invoicesQuery.isLoading && !invoicesQuery.data) ||
    (metricsQuery.isLoading && !metricsQuery.data);

  const isUpdating = !isInitialLoading && (invoicesQuery.isFetching || metricsQuery.isFetching);

  const tableState = isInitialLoading ? 'loading' : isUpdating ? 'updating' : 'idle';

  return (
    <InvoicesListContent
      invoices={invoices}
      pagination={pagination}
      profiles={profiles}
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
      initialTipo={normalizedParams.tipo}
      initialSearch={normalizedParams.search}
      tableState={tableState}
    />
  );
}
