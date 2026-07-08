import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import type { Expense } from "@/lib/types/expenses";
import { formatCurrency, formatDateShort } from "@/lib/utils/format";

interface RecentExpensesTableProps {
  expenses?: Expense[];
}

function getValidationIcon(expense: Expense) {
  if (expense.validacion?.valido) {
    return (
      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
      </div>
    );
  }
  return (
    <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
      <AlertCircle className="h-4 w-4 text-orange-400" />
    </div>
  );
}

function getPaymentStatusBadge(expense: Expense) {
    // Solo mostrar estado de pago para gastos XML con tipo PUE o PPD
    if (expense.tipo_origen !== 'XML' || !expense.tipo || expense.tipo === 'COMPLEMENTO_PAGO') {
      return null;
    }

    // Para gastos PUE, siempre están pagados
    if (expense.tipo === 'PUE') {
      return (
        <Badge className="bg-green-500 text-white text-xs mt-1">
          Pagado
        </Badge>
      );
    }

    // Para gastos PPD, verificar estado de pago
    if (expense.tipo === 'PPD') {
      const estadoPago = expense.estadoPago;

      // Si no hay estadoPago, considerar como no pagado
      if (!estadoPago) {
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs mt-1">
            No Pagado
          </Badge>
        );
      }

      // Si está completamente pagado
      if (estadoPago.completamentePagado || estadoPago.estado === 'PAGADO') {
        return (
          <Badge className="bg-green-500 text-white text-xs mt-1">
            Pagado
          </Badge>
        );
      }

      // Si tiene pago parcial
      if (estadoPago.estado === 'PAGO_PARCIAL' || estadoPago.porcentajePagado > 0) {
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs mt-1">
            Parcial ({Math.round(estadoPago.porcentajePagado)}%)
          </Badge>
        );
      }

      // Si no está pagado
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs mt-1">
          No Pagado
        </Badge>
      );
    }

    return null;
}

export function RecentExpensesTable({
  expenses = [],
}: RecentExpensesTableProps) {
  return (
    <Card data-tour="recent-expenses" className="min-w-0 overflow-hidden p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Últimos Gastos</h3>
        <Link
          href="/dashboard/expenses"
          className="text-sm text-primary hover:underline"
        >
          Ver todos
        </Link>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                PROVEEDOR / CONCEPTO
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                FECHA
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                MONTO
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                VALIDACIÓN
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.slice(0, 3).map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="py-3 px-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {expense.nombre_emisor || expense.concepto || "N/A"}
                      </p>
                      {expense.concepto && expense.nombre_emisor && (
                        <p className="text-xs text-muted-foreground">
                          {expense.concepto}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {formatDateShort(expense.fecha)}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium">
                    {formatCurrency(expense.total)}
                  </td>
                  <td className="py-3 px-2">
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
                  <EmptyState
                    icon={FileText}
                    title="No hay gastos recientes"
                    description="Los gastos que subas aparecerán aquí"
                    actionLabel="Ver todos los gastos"
                    actionHref="/dashboard/expenses"
                    variant="search"
                    compact
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

