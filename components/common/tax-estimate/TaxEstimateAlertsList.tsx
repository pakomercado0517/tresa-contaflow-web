import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TAX_ESTIMATE_PANEL_COPY } from '@/lib/constants/tax-estimate-field-labels';
import { getTaxEstimateAlertMeta } from '@/lib/constants/tax-estimate-alerts';
import type { TaxEstimateAlert } from '@/lib/types/tax-estimates';
import {
  getAlertClassForSeverity,
  getAlertVariantForSeverity,
  groupAlertsBySeverity,
} from '@/lib/utils/tax-estimate-alerts-ui';
import { cn } from '@/lib/utils';

interface TaxEstimateAlertsListProps {
  alerts: TaxEstimateAlert[];
  profileId?: string;
}

export function TaxEstimateAlertsList({ alerts, profileId }: TaxEstimateAlertsListProps) {
  const groups = groupAlertsBySeverity(alerts);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" aria-label="Alertas de la estimación fiscal">
      {groups.map((group) => {
        const groupId = `tax-alerts-${group.severity}`;
        return (
          <section key={group.severity} aria-labelledby={groupId}>
            <h3 id={groupId} className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
              {group.heading}
            </h3>
            <ul className="space-y-2">
              {group.alerts.map((alert) => {
                const meta = getTaxEstimateAlertMeta(alert.code);
                const showFiscalSettingsLink =
                  profileId && meta?.action === 'open_fiscal_settings';
                return (
                  <li key={`${alert.code}-${alert.message}`}>
                    <Alert
                      variant={getAlertVariantForSeverity(alert.severity)}
                      className={cn(getAlertClassForSeverity(alert.severity))}
                      role="status"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {meta?.title ? <AlertTitle>{meta.title}</AlertTitle> : null}
                      <AlertDescription>
                        {alert.message}
                        {showFiscalSettingsLink ? (
                          <Link
                            href={`/dashboard/setup/profiles/${profileId}#configuracion-fiscal`}
                            className="text-primary mt-2 block text-sm font-medium hover:underline"
                          >
                            {TAX_ESTIMATE_PANEL_COPY.fiscalSettingsLinkLabel}
                          </Link>
                        ) : null}
                      </AlertDescription>
                    </Alert>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
