import { Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TAX_ESTIMATE_PANEL_COPY } from '@/lib/constants/tax-estimate-field-labels';
import { formatTipoPersonaLabel } from '@/lib/utils/tax-estimate-labels';
import type { TaxEstimateTipoPersona } from '@/lib/types/tax-estimates';

interface TaxEstimatePanelHeaderProps {
  panelTitleId: string;
  regimenLabel: string;
  tipoPersona?: TaxEstimateTipoPersona;
  subtitle?: string;
}

export function TaxEstimatePanelHeader({
  panelTitleId,
  regimenLabel,
  tipoPersona,
  subtitle,
}: TaxEstimatePanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-primary/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Scale className="text-primary h-5 w-5" />
        </div>
        <div>
          <h2 id={panelTitleId} className="text-lg font-semibold tracking-tight">
            {TAX_ESTIMATE_PANEL_COPY.title}
          </h2>
          {subtitle ? (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          ) : regimenLabel ? (
            <p className="text-muted-foreground text-sm">{regimenLabel}</p>
          ) : null}
        </div>
      </div>
      {tipoPersona ? (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{regimenLabel}</Badge>
          <Badge variant="outline">{formatTipoPersonaLabel(tipoPersona)}</Badge>
        </div>
      ) : null}
    </div>
  );
}
