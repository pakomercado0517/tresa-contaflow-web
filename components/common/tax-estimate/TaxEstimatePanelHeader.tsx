import { Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TAX_ESTIMATE_PANEL_COPY } from '@/lib/constants/tax-estimate-field-labels';
import { formatTipoPersonaLabel } from '@/lib/utils/tax-estimate-labels';
import type { TaxEstimateTipoPersona } from '@/lib/types/tax-estimates';

export type TaxEstimatePanelHeaderMode = 'full' | 'regimen';

interface TaxEstimatePanelHeaderProps {
  panelTitleId: string;
  regimenLabel: string;
  tipoPersona?: TaxEstimateTipoPersona;
  subtitle?: string;
  /** `regimen`: título = régimen (evita duplicar el heading de la sección del dashboard). */
  mode?: TaxEstimatePanelHeaderMode;
}

export function TaxEstimatePanelHeader({
  panelTitleId,
  regimenLabel,
  tipoPersona,
  subtitle,
  mode = 'full',
}: TaxEstimatePanelHeaderProps) {
  const isRegimenMode = mode === 'regimen';
  const title = isRegimenMode
    ? regimenLabel || TAX_ESTIMATE_PANEL_COPY.title
    : TAX_ESTIMATE_PANEL_COPY.title;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {!isRegimenMode ? (
          <div className="bg-primary/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Scale className="text-primary h-5 w-5" />
          </div>
        ) : null}
        <div>
          <h3
            id={panelTitleId}
            className={
              isRegimenMode
                ? 'text-base font-semibold tracking-tight'
                : 'text-lg font-semibold tracking-tight'
            }
          >
            {title}
          </h3>
          {!isRegimenMode && subtitle ? (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          ) : null}
          {!isRegimenMode && !subtitle && regimenLabel ? (
            <p className="text-muted-foreground text-sm">{regimenLabel}</p>
          ) : null}
        </div>
      </div>
      {tipoPersona ? (
        <div className="flex flex-wrap gap-2">
          {!isRegimenMode ? <Badge variant="secondary">{regimenLabel}</Badge> : null}
          <Badge variant="outline">{formatTipoPersonaLabel(tipoPersona)}</Badge>
        </div>
      ) : null}
    </div>
  );
}
