import { Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { TAX_ESTIMATE_PANEL_COPY } from '@/lib/constants/tax-estimate-field-labels';
import type { TaxEstimateResult } from '@/lib/types/tax-estimates';
import { cn } from '@/lib/utils';
import { TaxEstimateAlertsList } from './tax-estimate/TaxEstimateAlertsList';
import { TaxEstimateDisclaimer } from './tax-estimate/TaxEstimateDisclaimer';
import { TaxEstimateIsrSection } from './tax-estimate/TaxEstimateIsrSection';
import { TaxEstimateIvaSection } from './tax-estimate/TaxEstimateIvaSection';
import { TaxEstimatePanelHeader } from './tax-estimate/TaxEstimatePanelHeader';

export interface TaxEstimatePanelProps {
  estimate: TaxEstimateResult | null;
  regimenLabel?: string;
  /** Identificador único para aria-labelledby cuando hay varios paneles en la página */
  panelKey?: string;
  profileId?: string;
  className?: string;
}

function getPanelTitleId(panelKey: string): string {
  return `tax-estimate-panel-title-${panelKey}`;
}

export function TaxEstimatePanel({
  estimate,
  regimenLabel,
  panelKey = 'default',
  profileId,
  className,
}: TaxEstimatePanelProps) {
  const panelTitleId = getPanelTitleId(panelKey);

  if (estimate === null) {
    return (
      <section aria-labelledby={panelTitleId} className={className}>
        <div className="mb-4">
          <TaxEstimatePanelHeader
            panelTitleId={panelTitleId}
            regimenLabel={regimenLabel ?? ''}
          />
        </div>
        <EmptyState
          icon={Calculator}
          title={TAX_ESTIMATE_PANEL_COPY.emptyTitle}
          description={TAX_ESTIMATE_PANEL_COPY.emptyDescription}
          compact
        />
      </section>
    );
  }

  const displayRegimenLabel = regimenLabel ?? estimate.regimen;

  return (
    <section aria-labelledby={panelTitleId} className={cn('space-y-4', className)}>
      <TaxEstimatePanelHeader
        panelTitleId={panelTitleId}
        regimenLabel={displayRegimenLabel}
        tipoPersona={estimate.tipo_persona}
        subtitle={TAX_ESTIMATE_PANEL_COPY.subtitle}
      />

      <TaxEstimateAlertsList alerts={estimate.alerts} profileId={profileId} />

      <Card className="border-border w-full shadow-sm">
        <CardContent className="space-y-8 p-6">
          <TaxEstimateIsrSection estimate={estimate} />
          <TaxEstimateIvaSection iva={estimate.iva} />
          <TaxEstimateDisclaimer disclaimer={estimate.disclaimer} />
        </CardContent>
      </Card>
    </section>
  );
}
