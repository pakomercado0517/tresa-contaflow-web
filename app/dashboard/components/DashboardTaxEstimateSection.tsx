'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TaxEstimatePanel } from '@/components/common/TaxEstimatePanel';
import { getRegimenLabel } from '@/lib/constants/sat';
import { TAX_ESTIMATE_PANEL_COPY } from '@/lib/constants/tax-estimate-field-labels';
import { ApiError } from '@/lib/api/client';
import { useTaxEstimates } from '@/lib/hooks/useTaxEstimates';
import { useSelectedDashboardProfile } from '@/lib/hooks/useSelectedDashboardProfile';
import type { TaxEstimateApiErrorBody } from '@/lib/types/tax-estimates';

const TaxEstimateHistorySection = dynamic(
  () =>
    import('./TaxEstimateHistorySection').then((mod) => ({
      default: mod.TaxEstimateHistorySection,
    })),
  {
    loading: () => <div className="bg-muted h-80 w-full animate-pulse rounded-lg" />,
    ssr: false,
  }
);

interface DashboardTaxEstimateSectionProps {
  profileId?: string;
  mes: number;
  año: number;
  regimenFiscal?: string;
}

function getTaxEstimateErrorMessage(error: Error): string {
  if (!(error instanceof ApiError)) {
    return error.message || 'No se pudo cargar la estimación fiscal.';
  }

  const body = error.data as TaxEstimateApiErrorBody | undefined;

  if (error.status === 400 && body?.code === 'REGIMEN_NOT_IN_PROFILE') {
    return 'El régimen filtrado no pertenece a este perfil. Cambia el filtro de régimen en el encabezado.';
  }

  if (error.status === 404) {
    return body?.error || 'Perfil no encontrado o sin acceso.';
  }

  return body?.error || error.message || 'No se pudo cargar la estimación fiscal.';
}

function TaxEstimateSectionShell({ children }: { children: ReactNode }) {
  return (
    <section
      id="tax-estimate-section"
      data-tour="tax-estimate-section"
      className="w-full min-w-0 space-y-5"
    >
      {children}
    </section>
  );
}

function TaxEstimateSectionHeading() {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-violet-400 uppercase">
        {TAX_ESTIMATE_PANEL_COPY.sectionEyebrow}
      </p>
      <h2 className="text-lg font-semibold tracking-tight">
        {TAX_ESTIMATE_PANEL_COPY.sectionTitle}
      </h2>
      <p className="text-muted-foreground max-w-2xl text-sm">
        {TAX_ESTIMATE_PANEL_COPY.sectionDescription}
      </p>
    </div>
  );
}

export function DashboardTaxEstimateSection({
  profileId,
  mes,
  año,
  regimenFiscal,
}: DashboardTaxEstimateSectionProps) {
  const { activeProfile } = useSelectedDashboardProfile(profileId);
  const regimenesFiscales = activeProfile?.regimenes_fiscales;
  const { data, isLoading, isError, error, refetch } = useTaxEstimates({
    profileId,
    mes,
    año,
    regimenFiscal,
    persist: true,
  });

  if (!profileId) {
    return (
      <TaxEstimateSectionShell>
        <TaxEstimateSectionHeading />
        <EmptyState
          icon={Building2}
          title="Selecciona un perfil"
          description="Elige un perfil en el encabezado para ver la estimación fiscal."
          compact
        />
      </TaxEstimateSectionShell>
    );
  }

  if (isLoading) {
    return (
      <TaxEstimateSectionShell>
        <TaxEstimateSectionHeading />
        <Card className="h-64 w-full animate-pulse border-violet-500/20 bg-[hsl(250,28%,14%)] shadow-sm" />
      </TaxEstimateSectionShell>
    );
  }

  if (isError && error) {
    return (
      <TaxEstimateSectionShell>
        <TaxEstimateSectionHeading />
        <ErrorState
          title="Estimación fiscal no disponible"
          message={getTaxEstimateErrorMessage(error)}
          onRetry={() => {
            void refetch();
          }}
        />
      </TaxEstimateSectionShell>
    );
  }

  const estimates = data?.estimates ?? [];
  const hasRegimenFilter = Boolean(regimenFiscal);

  const panels = hasRegimenFilter
    ? [
        {
          key: regimenFiscal as string,
          regimen: regimenFiscal as string,
          tax_estimate: estimates[0]?.tax_estimate ?? null,
        },
      ]
    : estimates.map((item) => ({
        key: item.regimen,
        regimen: item.regimen,
        tax_estimate: item.tax_estimate,
      }));

  return (
    <TaxEstimateSectionShell>
      <TaxEstimateSectionHeading />

      <div className="space-y-6">
        {panels.map((item) => (
          <TaxEstimatePanel
            key={item.key}
            panelKey={item.regimen}
            estimate={item.tax_estimate}
            regimenLabel={getRegimenLabel(item.regimen)}
            profileId={profileId}
            headerMode="regimen"
          />
        ))}
      </div>

      <TaxEstimateHistorySection
        key={profileId}
        profileId={profileId}
        ejercicio={año}
        mes={mes}
        headerRegimenFiscal={regimenFiscal}
        regimenesFiscales={regimenesFiscales}
      />
    </TaxEstimateSectionShell>
  );
}
