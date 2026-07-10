'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { getRegimenLabel } from '@/lib/constants/sat';
import { useTaxEstimateHistory } from '@/lib/hooks/useTaxEstimateHistory';
import { formatCurrency } from '@/lib/utils/format';
import { mapTaxEstimateSnapshotsToRows } from '@/lib/utils/tax-estimate-history';
import { cn } from '@/lib/utils';

const TaxEstimateHistoryLineChart = dynamic(
  () => import('./TaxEstimateHistoryLineChart'),
  {
    ssr: false,
    loading: () => <div className="bg-muted/30 h-72 w-full animate-pulse rounded-md" />,
  }
);

interface TaxEstimateHistorySectionProps {
  profileId: string;
  ejercicio: number;
  mes: number;
  headerRegimenFiscal?: string;
  regimenesFiscales?: string[];
}

function HistorySectionSkeleton() {
  return (
    <Card className="h-80 w-full animate-pulse border-violet-500/20 bg-[hsl(250,28%,14%)] shadow-sm" />
  );
}

function formatNetCell(value: number | null): string {
  if (value === null) {
    return '—';
  }
  return formatCurrency(value);
}

export function TaxEstimateHistorySection({
  profileId,
  ejercicio,
  mes,
  headerRegimenFiscal,
  regimenesFiscales = [],
}: TaxEstimateHistorySectionProps) {
  const regimenOptions = regimenesFiscales.length > 0 ? regimenesFiscales : [];
  const defaultLocalRegimen = regimenOptions[0] ?? '';

  const [localRegimen, setLocalRegimen] = useState(defaultLocalRegimen);

  const effectiveRegimen =
    headerRegimenFiscal ?? (localRegimen || regimenOptions[0] || undefined);

  const showRegimenSelector =
    !headerRegimenFiscal && regimenOptions.length > 1 && Boolean(effectiveRegimen);

  const regimenLabel = effectiveRegimen ? getRegimenLabel(effectiveRegimen) : '';

  const { data, isLoading, isError, error, refetch } = useTaxEstimateHistory({
    profileId,
    ejercicio,
    regimenFiscal: effectiveRegimen || undefined,
  });

  const snapshots = data?.snapshots;

  const rows = useMemo(() => {
    if (!snapshots) {
      return [];
    }
    return mapTaxEstimateSnapshotsToRows(snapshots, mes);
  }, [snapshots, mes]);

  const chartData = useMemo(
    () =>
      rows.map((row) => ({
        mesLabel: row.mesLabel,
        isrNeto: row.isrNeto,
        ivaNeto: row.ivaNeto,
      })),
    [rows]
  );

  if (!effectiveRegimen) {
    return null;
  }

  if (isLoading) {
    return <HistorySectionSkeleton />;
  }

  if (isError && error) {
    return (
      <ErrorState
        title="Historial fiscal no disponible"
        message={error.message || 'No se pudo cargar el historial de estimaciones.'}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sin historial en este ejercicio"
        description="Los puntos del historial se guardan al consultar la estimación fiscal en el dashboard (persistencia activa). Cambia de mes o vuelve más tarde para ver la tendencia."
        compact
      />
    );
  }

  return (
    <Card className="w-full border-violet-500/20 bg-[hsl(250,28%,14%)] p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">
              Tendencia ISR/IVA · {ejercicio}
            </h3>
            <p className="text-muted-foreground text-sm">{regimenLabel}</p>
          </div>
          {showRegimenSelector ? (
            <Select
              value={localRegimen}
              onValueChange={setLocalRegimen}
            >
              <SelectTrigger className="w-full sm:w-56" aria-label="Régimen para historial">
                <SelectValue placeholder="Régimen" />
              </SelectTrigger>
              <SelectContent>
                {regimenOptions.map((code) => (
                  <SelectItem key={code} value={code}>
                    {getRegimenLabel(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0 space-y-3">
            <TaxEstimateHistoryLineChart chartData={chartData} />
            <p className="text-muted-foreground text-xs">
              Valores informativos por mes; no sustituyen la declaración ante el SAT.
            </p>
          </div>

          <div className="min-w-0 overflow-x-auto rounded-md border lg:max-h-88 lg:overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">ISR neto a pagar</TableHead>
                  <TableHead className="text-right">IVA neto a pagar</TableHead>
                  <TableHead className="text-right">Saldo a favor ISR</TableHead>
                  <TableHead className="text-right">Saldo a favor IVA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.mes}
                    className={cn(row.isCurrentMonth && 'bg-muted/50')}
                  >
                    <TableCell className="font-medium">
                      {row.mesLabel}
                      {row.isCurrentMonth ? (
                        <span className="text-muted-foreground ml-2 text-xs">(actual)</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNetCell(row.isrNeto)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.ivaNeto)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNetCell(row.isrSaldoFavor)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.ivaSaldoFavor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
}
