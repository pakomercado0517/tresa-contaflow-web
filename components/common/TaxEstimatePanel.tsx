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
import {
  TaxEstimatePanelHeader,
  type TaxEstimatePanelHeaderMode,
} from './tax-estimate/TaxEstimatePanelHeader';

export type TaxEstimatePanelAppearance = 'default' | 'report';

export interface TaxEstimatePanelProps {
  estimate: TaxEstimateResult | null;
  regimenLabel?: string;
  /** Identificador único para aria-labelledby cuando hay varios paneles en la página */
  panelKey?: string;
  profileId?: string;
  appearance?: TaxEstimatePanelAppearance;
  /** En dashboard: `regimen` evita repetir el título de la sección. */
  headerMode?: TaxEstimatePanelHeaderMode;
  className?: string;
}

const TAX_ESTIMATE_REPORT_ROOT_CLASS =
  'tax-estimate-report-root bg-white text-gray-900 [&_.text-muted-foreground]:text-gray-500 [&_.text-foreground]:text-gray-900 [&_.border-border]:border-gray-200 [&_.bg-card]:bg-white [&_.bg-muted]:bg-gray-50';

function getPanelTitleId(panelKey: string): string {
  return `tax-estimate-panel-title-${panelKey}`;
}

export function TaxEstimatePanel({
  estimate,
  regimenLabel,
  panelKey = 'default',
  profileId,
  appearance = 'default',
  headerMode = 'full',
  className,
}: TaxEstimatePanelProps) {
  const panelTitleId = getPanelTitleId(panelKey);
  const isReport = appearance === 'report';
  const isCompactHeader = headerMode === 'regimen';
  const rootClass = isReport ? TAX_ESTIMATE_REPORT_ROOT_CLASS : undefined;
  const cardClass = isReport
    ? 'border-gray-200 bg-white w-full shadow-none'
    : isCompactHeader
      ? 'w-full border-violet-500/20 bg-[hsl(250,28%,14%)] shadow-sm'
      : 'border-border w-full shadow-sm';

  if (estimate === null) {
    return (
      <section
        aria-labelledby={panelTitleId}
        className={cn(rootClass, className)}
      >
        <div className="mb-4">
          <TaxEstimatePanelHeader
            panelTitleId={panelTitleId}
            regimenLabel={regimenLabel ?? ''}
            mode={headerMode}
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
    <section
      aria-labelledby={panelTitleId}
      className={cn(isCompactHeader ? 'space-y-3' : 'space-y-4', rootClass, className)}
    >
      <TaxEstimatePanelHeader
        panelTitleId={panelTitleId}
        regimenLabel={displayRegimenLabel}
        tipoPersona={estimate.tipo_persona}
        subtitle={isCompactHeader ? undefined : TAX_ESTIMATE_PANEL_COPY.subtitle}
        mode={headerMode}
      />

      <TaxEstimateAlertsList alerts={estimate.alerts} profileId={profileId} />

      <Card className={cardClass}>
        <CardContent
          className={isCompactHeader ? 'space-y-6 p-5 md:p-6' : 'space-y-8 p-6'}
        >
          <TaxEstimateIsrSection estimate={estimate} />
          <TaxEstimateIvaSection iva={estimate.iva} />
          <TaxEstimateDisclaimer disclaimer={estimate.disclaimer} />
        </CardContent>
      </Card>
    </section>
  );
}
