'use client';

import { FileX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { DashboardListItemCard } from '@/components/common/DashboardListItemCard';
import {
  DashboardListDesktop,
  DashboardListMobile,
} from '@/components/common/dashboard-list-responsive';
import { TableRowsSkeleton } from '@/components/common/skeletons/TableRowsSkeleton';
import { DashboardUpdatingOverlay } from '@/components/common/DashboardUpdatingOverlay';
import type { Expense } from '@/lib/types/expenses';
import { formatCurrency, formatDateShort } from '@/lib/utils/format';
import {
  getExpenseCategoryBadge,
  getExpenseOriginBadge,
  getExpensePaymentStatusBadge,
} from './expenses-list-display-utils';

interface ExpensesXmlTableSectionProps {
  expenses: Expense[];
  search: string;
  tableState: 'idle' | 'loading' | 'updating';
  onDelete: (expense: Expense) => void;
}

function ExpensesEmptyState({ search }: { search: string }) {
  return (
    <EmptyState
      icon={FileX}
      title={
        search
          ? `No se encontraron gastos que coincidan con "${search}"`
          : 'No se encontraron gastos'
      }
      description={
        search
          ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
          : 'Comienza subiendo archivos XML o creando gastos manuales'
      }
      actionLabel={search ? undefined : 'Subir Gastos XML'}
      actionHref={search ? undefined : '/dashboard/expenses/upload'}
      variant="search"
      compact
    />
  );
}

function ExpenseDeleteButton({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: (expense: Expense) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title="Eliminar gasto"
      onClick={() => onDelete(expense)}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function formatExpenseUuid(uuid: string | null): string {
  if (!uuid) return '--';
  return `${uuid.slice(0, 8)}...${uuid.slice(-4)}`;
}

export function ExpensesXmlTableSection({
  expenses,
  search,
  tableState,
  onDelete,
}: ExpensesXmlTableSectionProps) {
  return (
    <div
      data-tour="expenses-table"
      className="bg-card relative min-w-0 overflow-hidden rounded-lg border"
    >
      <DashboardListMobile className="p-3">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <DashboardListItemCard
              key={expense.id}
              title={
                <p className="truncate" title={expense.nombre_emisor || 'Sin emisor'}>
                  {expense.nombre_emisor || 'Sin emisor'}
                </p>
              }
              subtitle={
                <div className="space-y-0.5">
                  <p className="truncate" title={expense.concepto || 'Sin concepto'}>
                    {expense.concepto || 'Sin concepto'}
                  </p>
                  <p className="font-mono" title={expense.uuid || undefined}>
                    {formatExpenseUuid(expense.uuid)}
                  </p>
                </div>
              }
              badge={
                <div className="flex flex-col items-end gap-1">
                  {getExpensePaymentStatusBadge(expense)}
                  <div className="flex flex-wrap justify-end gap-1">
                    {getExpenseCategoryBadge(expense.categoria)}
                    {getExpenseOriginBadge(expense.tipo_origen)}
                  </div>
                </div>
              }
              meta={formatDateShort(expense.fecha)}
              amount={formatCurrency(expense.subtotal)}
              fields={[
                {
                  label: 'IVA Trasl.',
                  value: formatCurrency(expense.iva_amount ?? expense.iva ?? 0),
                },
                {
                  label: 'Ret. IVA',
                  value: formatCurrency(expense.retencion_iva_amount ?? 0),
                },
                {
                  label: 'Ret. ISR',
                  value: formatCurrency(expense.retencion_isr_amount ?? 0),
                },
              ]}
              actions={<ExpenseDeleteButton expense={expense} onDelete={onDelete} />}
            />
          ))
        ) : (
          <div className="py-4">
            <ExpensesEmptyState search={search} />
          </div>
        )}
      </DashboardListMobile>

      <DashboardListDesktop>
        <div className="relative max-h-150 overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead className="min-w-30">FECHA</TableHead>
                <TableHead className="min-w-62.5">EMISOR / CONCEPTO</TableHead>
                <TableHead className="min-w-37.5">CATEGORÍA</TableHead>
                <TableHead className="min-w-25">ORIGEN</TableHead>
                <TableHead className="min-w-37.5">UUID</TableHead>
                <TableHead className="min-w-27.5 text-right">MONTO</TableHead>
                <TableHead className="min-w-25 text-right">IVA TRASL.</TableHead>
                <TableHead className="min-w-23.75 text-right">RET. IVA</TableHead>
                <TableHead className="min-w-23.75 text-right">RET. ISR</TableHead>
                <TableHead className="min-w-30">ESTADO PAGO</TableHead>
                <TableHead className="min-w-25 text-right">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateShort(expense.fecha)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-62.5">
                        <p
                          className="truncate text-sm font-medium"
                          title={expense.nombre_emisor || 'Sin emisor'}
                        >
                          {expense.nombre_emisor || 'Sin emisor'}
                        </p>
                        <p
                          className="text-muted-foreground truncate text-xs"
                          title={expense.concepto || 'Sin concepto'}
                        >
                          {expense.concepto || 'Sin concepto'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getExpenseCategoryBadge(expense.categoria)}</TableCell>
                    <TableCell>{getExpenseOriginBadge(expense.tipo_origen)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="max-w-37.5 truncate" title={expense.uuid || '--'}>
                        {formatExpenseUuid(expense.uuid)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                      {formatCurrency(expense.subtotal)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                      {formatCurrency(expense.iva_amount ?? expense.iva ?? 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                      {formatCurrency(expense.retencion_iva_amount ?? 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                      {formatCurrency(expense.retencion_isr_amount ?? 0)}
                    </TableCell>
                    <TableCell>{getExpensePaymentStatusBadge(expense)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ExpenseDeleteButton expense={expense} onDelete={onDelete} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="py-8">
                    <ExpensesEmptyState search={search} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardListDesktop>

      {tableState === 'loading' && (
        <div className="absolute inset-0 z-10">
          <DashboardUpdatingOverlay />
          <TableRowsSkeleton rows={10} />
        </div>
      )}
      {tableState === 'updating' && <DashboardUpdatingOverlay />}
    </div>
  );
}
