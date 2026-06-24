'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getTaxEstimateAlertMeta } from '@/lib/constants/tax-estimate-alerts';
import { getRegimenLabel } from '@/lib/constants/sat';
import { useTaxEstimates } from '@/lib/hooks/useTaxEstimates';
import { collectCriticalTaxEstimateAlerts } from '@/lib/utils/tax-estimate-alerts-ui';
import { cn } from '@/lib/utils';

const BANNER_DISMISS_PREFIX = 'tax-estimate-critical-banner';
const MAX_BANNER_ITEMS = 3;

interface DashboardTaxEstimateCriticalBannerProps {
  profileId?: string;
  mes: number;
  año: number;
  regimenFiscal?: string;
}

function getDismissStorageKey(profileId: string, mes: number, año: number): string {
  return `${BANNER_DISMISS_PREFIX}:${profileId}:${año}-${mes}`;
}

export function DashboardTaxEstimateCriticalBanner({
  profileId,
  mes,
  año,
  regimenFiscal,
}: DashboardTaxEstimateCriticalBannerProps) {
  const dismissKey = profileId ? getDismissStorageKey(profileId, mes, año) : null;

  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined' || !dismissKey) {
      return false;
    }
    return sessionStorage.getItem(dismissKey) === '1';
  });

  const { data, isLoading, isError } = useTaxEstimates({
    profileId,
    mes,
    año,
    regimenFiscal,
    persist: true,
  });

  const estimates = data?.estimates;

  const criticalAlerts = useMemo(() => {
    if (!estimates) {
      return [];
    }
    return collectCriticalTaxEstimateAlerts(estimates);
  }, [estimates]);

  const hasFiscalSettingsAction = criticalAlerts.some(
    (item) => getTaxEstimateAlertMeta(item.alert.code)?.action === 'open_fiscal_settings'
  );

  if (!profileId || isDismissed || isLoading || isError || criticalAlerts.length === 0) {
    return null;
  }

  const hasError = criticalAlerts.some((item) => item.alert.severity === 'error');
  const displayAlerts = criticalAlerts.slice(0, MAX_BANNER_ITEMS);

  const handleDismiss = () => {
    if (dismissKey) {
      sessionStorage.setItem(dismissKey, '1');
    }
    setIsDismissed(true);
  };

  return (
    <Alert
      variant={hasError ? 'destructive' : 'default'}
      className={cn(
        'relative pr-10',
        !hasError && 'border-amber-500/50 bg-amber-500/5 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400'
      )}
      role="status"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Revisa tu estimación fiscal</AlertTitle>
      <AlertDescription className="space-y-3">
        <ul className="space-y-1.5 text-sm">
          {displayAlerts.map((item) => {
            const meta = getTaxEstimateAlertMeta(item.alert.code);
            const label = meta?.title ?? item.alert.message;
            return (
              <li key={`${item.regimen}-${item.alert.code}`}>
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground"> — {getRegimenLabel(item.regimen)}</span>
              </li>
            );
          })}
        </ul>
        {criticalAlerts.length > MAX_BANNER_ITEMS ? (
          <p className="text-muted-foreground text-xs">
            Y {criticalAlerts.length - MAX_BANNER_ITEMS} alerta(s) más en el detalle.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <Link href="#tax-estimate-section">Ver detalle</Link>
          </Button>
          {hasFiscalSettingsAction ? (
            <Button variant="link" size="sm" className="h-auto p-0" asChild>
              <Link href={`/dashboard/setup/profiles/${profileId}#configuracion-fiscal`}>
                Configurar datos fiscales
              </Link>
            </Button>
          ) : null}
        </div>
      </AlertDescription>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={handleDismiss}
        aria-label="Ocultar aviso de estimación fiscal"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
