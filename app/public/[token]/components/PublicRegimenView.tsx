'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getRegimenLabel } from '@/lib/constants/sat';
import { PublicMetricsCards } from './PublicMetricsCards';
import { PublicChartWrapper } from './PublicChartWrapper';
import { TaxEstimateRegimenHint } from './TaxEstimateRegimenHint';
import { TaxEstimatePanel } from '@/components/common/TaxEstimatePanel';
import { PRODUCT_FEATURES } from '@/lib/constants/product-features';
import type { PublicReportMetrics, PublicReportMetricsByRegimen } from '@/lib/types/public-reports';
import type { TaxEstimateResult } from '@/lib/types/tax-estimates';
import { AlertTriangle, Layers } from 'lucide-react';

interface PublicRegimenViewProps {
  /** Métricas consolidadas (todos los regímenes) */
  metrics: PublicReportMetrics | null;
  /** Desglose por régimen — puede estar vacío si el perfil tiene un solo régimen */
  metricsByRegimen: PublicReportMetricsByRegimen[];
}

const ALL_KEY = '__all__';

function resolveActiveRegimenItem(
  selected: string,
  metricsByRegimen: PublicReportMetricsByRegimen[],
  hasMultiple: boolean
): PublicReportMetricsByRegimen | undefined {
  if (metricsByRegimen.length === 0) {
    return undefined;
  }
  if (hasMultiple && selected !== ALL_KEY) {
    return metricsByRegimen.find((item) => item.regimen === selected);
  }
  return metricsByRegimen[0];
}

function resolveActiveTaxEstimate(
  selected: string,
  metricsByRegimen: PublicReportMetricsByRegimen[],
  hasMultiple: boolean
): TaxEstimateResult | null {
  const item = resolveActiveRegimenItem(selected, metricsByRegimen, hasMultiple);
  return item?.tax_estimate ?? null;
}

export function PublicRegimenView({ metrics, metricsByRegimen }: PublicRegimenViewProps) {
  const [selected, setSelected] = useState<string>(ALL_KEY);

  const hasMultiple = metricsByRegimen.length >= 2;
  const showTaxEstimateHint =
    PRODUCT_FEATURES.taxEstimate && hasMultiple && selected === ALL_KEY;
  const showTaxEstimatePanel =
    PRODUCT_FEATURES.taxEstimate &&
    metricsByRegimen.length > 0 &&
    !(hasMultiple && selected === ALL_KEY);

  const activeRegimenItem = resolveActiveRegimenItem(selected, metricsByRegimen, hasMultiple);
  const activeTaxEstimate = resolveActiveTaxEstimate(selected, metricsByRegimen, hasMultiple);
  const activeRegimenLabel = activeRegimenItem
    ? getRegimenLabel(activeRegimenItem.regimen)
    : undefined;

  const activeMetrics: PublicReportMetrics | null =
    selected === ALL_KEY
      ? metrics
      : (metricsByRegimen.find((r) => r.regimen === selected)?.metrics ?? null);

  const isNull = activeMetrics === null;

  const activeLabel = selected === ALL_KEY ? 'Resumen general' : getRegimenLabel(selected);

  const shouldRenderTaxPanel =
    showTaxEstimatePanel && (!isNull || activeTaxEstimate !== null);

  return (
    <div className="space-y-6">
      {/* Selector de actividad — solo visible si hay 2+ regímenes */}
      {hasMultiple && (
        <div className="border-border bg-card space-y-3 rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Layers className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Ver cifras por tipo de actividad
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Este cliente tiene más de una actividad económica registrada. Puedes ver el resumen
                general o las cifras de cada actividad por separado.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(ALL_KEY)}
              className={cn(
                'focus-visible:ring-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                selected === ALL_KEY
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground bg-transparent'
              )}
            >
              Resumen general
            </button>

            {metricsByRegimen.map(({ regimen }) => {
              const isActive = selected === regimen;
              const label = getRegimenLabel(regimen);
              return (
                <button
                  key={regimen}
                  type="button"
                  onClick={() => setSelected(regimen)}
                  className={cn(
                    'focus-visible:ring-ring rounded-full border px-4 py-1.5 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground bg-transparent'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="text-muted-foreground text-xs">
            Viendo: <span className="text-foreground font-semibold">{activeLabel}</span>
          </p>
        </div>
      )}

      {isNull && (
        <div className="border-border bg-muted/30 flex items-start gap-3 rounded-lg border p-4">
          <AlertTriangle className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-muted-foreground text-sm">
            No hay datos disponibles para esta actividad en el periodo actual.
          </p>
        </div>
      )}

      {!isNull && (
        <>
          <PublicMetricsCards metrics={activeMetrics} />
          <PublicChartWrapper metrics={activeMetrics} />
        </>
      )}

      {showTaxEstimateHint ? <TaxEstimateRegimenHint /> : null}

      {shouldRenderTaxPanel ? (
        <TaxEstimatePanel estimate={activeTaxEstimate} regimenLabel={activeRegimenLabel} />
      ) : null}
    </div>
  );
}
