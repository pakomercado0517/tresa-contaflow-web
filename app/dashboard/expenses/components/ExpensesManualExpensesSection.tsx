'use client';

import { Receipt } from 'lucide-react';
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
import { DashboardUpdatingOverlay } from '@/components/common/DashboardUpdatingOverlay';
import type { Expense } from '@/lib/types/expenses';
import { formatCurrency, formatDateShort } from '@/lib/utils/format';
import {
  getManualEntryTotal,
  resolveManualEntryIvaAmount,
} from '@/lib/utils/manual-entry-iva';

interface ExpensesManualExpensesSectionProps {
  canAddManualExpense: boolean;
  manualExpenseDisabledReason: 'no_profile' | 'no_period' | null;
  manualExpensesState: 'idle' | 'loading' | 'updating' | 'disabled';
  manualExpenses: Expense[];
  onAddManualExpense: () => void;
  onEditManual: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpensesManualExpensesSection({
  canAddManualExpense,
  manualExpenseDisabledReason,
  manualExpensesState,
  manualExpenses,
  onAddManualExpense,
  onEditManual,
  onDelete,
}: ExpensesManualExpensesSectionProps) {
  if (!canAddManualExpense) {
    return (
      <div className="bg-muted/30 rounded-lg border border-dashed p-4 text-center">
        <p className="text-muted-foreground text-sm">
          {manualExpenseDisabledReason === 'no_profile'
            ? 'Selecciona un perfil en el selector de arriba (no «Todos») para ver y agregar gastos manuales.'
            : 'No se obtuvo un período para este perfil y mes/año. El backend debe devolver el ID del período en métricas.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card min-w-0 overflow-hidden rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="text-muted-foreground text-sm font-medium">
          Gastos manuales (sin factura CFDI)
        </h2>
      </div>
      <div className="relative min-w-0 overflow-x-auto">
        {manualExpensesState === 'loading' ? (
          <div className="p-6">
            <TableRowsSkeleton rows={3} />
          </div>
        ) : manualExpenses.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Receipt}
              title="Sin gastos manuales"
              description="Los gastos que registres aquí no tienen factura CFDI. Usa el botón «Gasto manual» para agregar uno."
              actionLabel="Agregar gasto manual"
              onAction={onAddManualExpense}
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
                <TableHead className="min-w-22.5">Pagado</TableHead>
                <TableHead className="min-w-20 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manualExpenses.map((expense) => {
                const ivaAmount = resolveManualEntryIvaAmount(expense);
                const total = getManualEntryTotal(expense);
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.concepto || 'Sin concepto'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateShort(expense.fecha)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(expense.subtotal)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {formatCurrency(ivaAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell>
                      {expense.is_paid ? (
                        <Badge className="bg-green-500/10 text-green-600">Sí</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEditManual(expense)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(expense)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {manualExpensesState === 'updating' && manualExpenses.length > 0 && (
          <DashboardUpdatingOverlay />
        )}
      </div>
    </div>
  );
}
