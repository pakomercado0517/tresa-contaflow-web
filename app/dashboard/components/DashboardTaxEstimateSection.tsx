'use client';

import { Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TaxEstimatePanel } from '@/components/common/TaxEstimatePanel';
import { getRegimenLabel } from '@/lib/constants/sat';
import { ApiError } from '@/lib/api/client';
import { useTaxEstimates } from '@/lib/hooks/useTaxEstimates';
import type { TaxEstimateApiErrorBody } from '@/lib/types/tax-estimates';

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

function TaxEstimateSectionSkeleton() {
  return <Card className="border-border h-64 w-full animate-pulse shadow-sm" />;
}

export function DashboardTaxEstimateSection({
  profileId,
  mes,
  año,
  regimenFiscal,
}: DashboardTaxEstimateSectionProps) {
  const { data, isLoading, isError, error, refetch } = useTaxEstimates({
    profileId,
    mes,
    año,
    regimenFiscal,
    persist: true,
  });

  if (!profileId) {
    return (
      <EmptyState
        icon={Building2}
        title="Selecciona un perfil"
        description="Elige un perfil en el encabezado para ver la estimación fiscal informativa."
        compact
      />
    );
  }

  if (isLoading) {
    return <TaxEstimateSectionSkeleton />;
  }

  if (isError && error) {
    return (
      <ErrorState
        title="Estimación fiscal no disponible"
        message={getTaxEstimateErrorMessage(error)}
        onRetry={() => {
          void refetch();
        }}
      />
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
    <div className="space-y-6" data-tour="tax-estimate-section">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Estimación fiscal del periodo</h2>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Las tarjetas de arriba muestran impuestos desglosados por CFDI (flujo y devengado). Aquí
          verás ISR e IVA netos orientativos según régimen, incluyendo provisionales y saldos
          configurados.
        </p>
      </div>

      <div className="space-y-8">
        {panels.map((item) => (
          <TaxEstimatePanel
            key={item.key}
            panelKey={item.regimen}
            estimate={item.tax_estimate}
            regimenLabel={getRegimenLabel(item.regimen)}
            profileId={profileId}
          />
        ))}
      </div>
    </div>
  );
}
