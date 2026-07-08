'use client';

import { HandCoins, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { TableRowsSkeleton } from '@/components/common/skeletons/TableRowsSkeleton';
import type { ManualIncome } from '@/lib/types/manual-incomes';
import { formatCurrency } from '@/lib/utils/format';

interface ManualIncomesSectionProps {
  canAddManualIncome: boolean;
  manualIncomeDisabledReason: 'no_profile' | 'no_period' | null;
  manualIncomesState: 'idle' | 'loading' | 'updating' | 'disabled';
  manualIncomes: ManualIncome[];
  onAddManualIncome: () => void;
  onEditManualIncome: (income: ManualIncome) => void;
  onDeleteManualIncome: (income: ManualIncome) => void;
}

export function ManualIncomesSection({
  canAddManualIncome,
  manualIncomeDisabledReason,
  manualIncomesState,
  manualIncomes,
  onAddManualIncome,
  onEditManualIncome,
  onDeleteManualIncome,
}: ManualIncomesSectionProps) {
  if (!canAddManualIncome) {
    return (
      <div className="bg-muted/30 rounded-lg border border-dashed p-4 text-center">
        <p className="text-muted-foreground text-sm">
          {manualIncomeDisabledReason === 'no_profile'
            ? 'Selecciona un perfil en el selector de arriba (no «Todos») para ver y agregar ingresos manuales.'
            : 'No se obtuvo un período para este perfil y mes/año. El backend debe devolver el ID del período en GET /api/metrics cuando se envía profile_id, mes y año.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card min-w-0 overflow-hidden rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="text-muted-foreground text-sm font-medium">
          Ingresos manuales (sin factura CFDI)
        </h2>
      </div>
      <div className="relative min-w-0 overflow-x-auto">
        {manualIncomesState === 'loading' ? (
          <div className="p-6">
            <TableRowsSkeleton rows={3} />
          </div>
        ) : manualIncomes.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={HandCoins}
              title="Sin ingresos manuales"
              description="Los ingresos que registres aquí no tienen factura CFDI. Usa el botón «Ingreso manual» para agregar uno."
              actionLabel="Agregar ingreso manual"
              onAction={onAddManualIncome}
              variant="empty"
              compact
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-45">Concepto</TableHead>
                <TableHead className="min-w-25">Fecha</TableHead>
                <TableHead className="min-w-25 text-right">Subtotal</TableHead>
                <TableHead className="min-w-20 text-right">IVA</TableHead>
                <TableHead className="min-w-25 text-right">Total</TableHead>
                <TableHead className="min-w-22.5">Cobrado</TableHead>
                <TableHead className="min-w-20 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manualIncomes.map((income) => {
                const total = income.subtotal + income.iva_amount;
                return (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium">{income.concept}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(income.fecha).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(income.subtotal)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {formatCurrency(income.iva_amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell>
                      {income.is_paid ? (
                        <Badge className="bg-green-500/10 text-green-600">Sí</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar ingreso manual"
                          onClick={() => onEditManualIncome(income)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar ingreso manual"
                          onClick={() => onDeleteManualIncome(income)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {manualIncomesState === 'updating' && manualIncomes.length > 0 && (
          <div className="bg-background/80 absolute inset-0 backdrop-blur-[1px]" />
        )}
      </div>
    </div>
  );
}
