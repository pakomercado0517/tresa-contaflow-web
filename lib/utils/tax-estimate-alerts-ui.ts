import type {
  TaxEstimateAlert,
  TaxEstimateAlertSeverity,
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
