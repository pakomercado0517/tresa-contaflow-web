import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import type { Expense } from '@/lib/types/expenses';
import { formatCurrency, formatDateShort } from '@/lib/utils/format';

interface RecentExpensesTableProps {
  expenses?: Expense[];
}

function getValidationIcon(expense: Expense) {
  if (expense.validacion?.valido) {
    return (
      <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
        <CheckCircle2 className="text-primary-foreground h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/20">
      <AlertCircle className="h-4 w-4 text-orange-400" />
    </div>
  );
}

function getPaymentStatusBadge(expense: Expense) {
  if (expense.tipo_origen !== 'XML' || !expense.tipo || expense.tipo === 'COMPLEMENTO_PAGO') {
    return null;
  }

  if (expense.tipo === 'PUE') {
    return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 mt-1 text-xs">Pagado</Badge>;
  }

  if (expense.tipo === 'PPD') {
    const estadoPago = expense.estadoPago;

    if (!estadoPago) {
      return (
        <Badge variant="outline" className="mt-1 border-orange-500 text-xs text-orange-600">
          No Pagado
        </Badge>
      );
    }

    if (estadoPago.completamentePagado || estadoPago.estado === 'PAGADO') {
      return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 mt-1 text-xs">Pagado</Badge>;
    }

    if (estadoPago.estado === 'PAGO_PARCIAL' || estadoPago.porcentajePagado > 0) {
      return (
        <Badge variant="outline" className="mt-1 border-blue-500 text-xs text-blue-600">
          Parcial ({Math.round(estadoPago.porcentajePagado)}%)
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="mt-1 border-orange-500 text-xs text-orange-600">
        No Pagado
      </Badge>
    );
  }

  return null;
}

function RecentExpensesEmptyState() {
  return (
    <EmptyState
      icon={FileText}
      title="No hay gastos recientes"
      description="Los gastos que subas aparecerán aquí"
      actionLabel="Ver todos los gastos"
      actionHref="/dashboard/expenses"
      variant="search"
      compact
    />
  );
}

function RecentExpenseItemCard({ expense }: { expense: Expense }) {
  const title = expense.nombre_emisor || expense.concepto || 'N/A';
  const subtitle =
    expense.concepto && expense.nombre_emisor ? expense.concepto : null;
  const paymentBadge = getPaymentStatusBadge(expense);

  return (
    <article className="border-border bg-muted/30 space-y-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium">{title}</p>
          {subtitle && (
            <p className="text-muted-foreground line-clamp-2 text-xs">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {getValidationIcon(expense)}
          {paymentBadge}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{formatDateShort(expense.fecha)}</p>
        <p className="text-sm font-semibold">{formatCurrency(expense.total)}</p>
      </div>
    </article>
  );
}

export function RecentExpensesTable({ expenses = [] }: RecentExpensesTableProps) {
  const recentExpenses = expenses.slice(0, 3);

  return (
    <Card
      data-tour="recent-expenses"
      className="border-border bg-card min-w-0 overflow-hidden p-4 md:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Últimos Gastos</h3>
        <Link href="/dashboard/expenses" className="text-primary text-sm hover:underline">
          Ver todos
        </Link>
      </div>

      {/* Lista en cards — móvil */}
      <div className="space-y-3 md:hidden">
        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense) => (
            <RecentExpenseItemCard key={expense.id} expense={expense} />
          ))
        ) : (
          <div className="py-4">
            <RecentExpensesEmptyState />
          </div>
        )}
      </div>

      {/* Tabla — desktop */}
      <div className="hidden min-w-0 overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-border border-b">
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                PROVEEDOR / CONCEPTO
              </th>
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                FECHA
              </th>
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                MONTO
              </th>
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                VALIDACIÓN
              </th>
            </tr>
          </thead>
          <tbody>
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <tr key={expense.id} className="border-border hover:bg-muted/50 border-b">
                  <td className="px-2 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {expense.nombre_emisor || expense.concepto || 'N/A'}
                      </p>
                      {expense.concepto && expense.nombre_emisor && (
                        <p className="text-muted-foreground text-xs">{expense.concepto}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-2 py-3 text-sm">
                    {formatDateShort(expense.fecha)}
                  </td>
                  <td className="px-2 py-3 text-sm font-medium">
                    {formatCurrency(expense.total)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-col items-start gap-1">
                      {getValidationIcon(expense)}
                      {getPaymentStatusBadge(expense)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8">
                  <RecentExpensesEmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
