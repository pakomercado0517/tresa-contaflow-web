import type { TaxEstimateSnapshot } from '@/lib/types/tax-estimates';

export const TAX_ESTIMATE_HISTORY_MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const;

export interface TaxEstimateHistoryRow {
  mes: number;
  mesLabel: string;
  isrNeto: number | null;
  ivaNeto: number;
  isrSaldoFavor: number | null;
  ivaSaldoFavor: number;
  isCurrentMonth: boolean;
}

function snapshotSortKey(snapshot: TaxEstimateSnapshot): number {
  return new Date(snapshot.computed_at).getTime();
}

function dedupeSnapshotsByMonth(snapshots: TaxEstimateSnapshot[]): TaxEstimateSnapshot[] {
  const byMes = new Map<number, TaxEstimateSnapshot>();

  snapshots.forEach((snapshot) => {
    const existing = byMes.get(snapshot.mes);
    if (!existing || snapshotSortKey(snapshot) > snapshotSortKey(existing)) {
      byMes.set(snapshot.mes, snapshot);
    }
  });

  return Array.from(byMes.values()).sort((a, b) => a.mes - b.mes);
}

export function mapTaxEstimateSnapshotsToRows(
  snapshots: TaxEstimateSnapshot[],
  currentMes: number
): TaxEstimateHistoryRow[] {
  const unique = dedupeSnapshotsByMonth(snapshots);

  return unique.map((snapshot) => {
    const { payload } = snapshot;
    const isr = payload.isr;

    return {
      mes: snapshot.mes,
      mesLabel: TAX_ESTIMATE_HISTORY_MONTHS_SHORT[snapshot.mes - 1] ?? String(snapshot.mes),
      isrNeto: isr?.isr_neto_a_pagar ?? null,
      ivaNeto: payload.iva.iva_neto_a_pagar,
      isrSaldoFavor: isr?.saldo_a_favor ?? null,
      ivaSaldoFavor: payload.iva.saldo_a_favor,
      isCurrentMonth: snapshot.mes === currentMes,
    };
  });
}
