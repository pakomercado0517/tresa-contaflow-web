import type {
  TaxEstimateAlert,
  TaxEstimateAlertSeverity,
  TaxEstimateRegimenItem,
} from '@/lib/types/tax-estimates';

export const TAX_ESTIMATE_ALERT_SEVERITY_ORDER: TaxEstimateAlertSeverity[] = [
  'error',
  'warning',
  'info',
];

export interface TaxEstimateAlertGroup {
  severity: TaxEstimateAlertSeverity;
  heading: string;
  alerts: TaxEstimateAlert[];
}

export function getAlertGroupHeading(severity: TaxEstimateAlertSeverity): string {
  switch (severity) {
    case 'error':
      return 'Errores';
    case 'warning':
      return 'Advertencias';
    case 'info':
      return 'Información';
    default:
      return 'Alertas';
  }
}

export function groupAlertsBySeverity(alerts: TaxEstimateAlert[]): TaxEstimateAlertGroup[] {
  return TAX_ESTIMATE_ALERT_SEVERITY_ORDER.map((severity) => ({
    severity,
    heading: getAlertGroupHeading(severity),
    alerts: alerts.filter((alert) => alert.severity === severity),
  })).filter((group) => group.alerts.length > 0);
}

export function getAlertVariantForSeverity(
  severity: TaxEstimateAlertSeverity
): 'default' | 'destructive' {
  return severity === 'error' ? 'destructive' : 'default';
}

export function getAlertClassForSeverity(severity: TaxEstimateAlertSeverity): string {
  if (severity === 'warning') {
    return 'border-amber-500/50 bg-amber-500/5 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400';
  }
  if (severity === 'info') {
    return 'border-border bg-muted/30';
  }
  return '';
}

export interface TaxEstimateAlertWithRegimen {
  regimen: string;
  alert: TaxEstimateAlert;
}

const CRITICAL_SEVERITIES: TaxEstimateAlertSeverity[] = ['error', 'warning'];

function criticalSeverityRank(severity: TaxEstimateAlertSeverity): number {
  return severity === 'error' ? 0 : 1;
}

export function collectCriticalTaxEstimateAlerts(
  estimates: TaxEstimateRegimenItem[]
): TaxEstimateAlertWithRegimen[] {
  const seen = new Set<string>();
  const collected: TaxEstimateAlertWithRegimen[] = [];

  estimates.forEach((item) => {
    const alerts = item.tax_estimate?.alerts ?? [];
    alerts.forEach((alert) => {
      if (!CRITICAL_SEVERITIES.includes(alert.severity)) {
        return;
      }
      const dedupeKey = `${item.regimen}:${alert.code}`;
      if (seen.has(dedupeKey)) {
        return;
      }
      seen.add(dedupeKey);
      collected.push({ regimen: item.regimen, alert });
    });
  });

  return collected.sort(
    (a, b) => criticalSeverityRank(a.alert.severity) - criticalSeverityRank(b.alert.severity)
  );
}
