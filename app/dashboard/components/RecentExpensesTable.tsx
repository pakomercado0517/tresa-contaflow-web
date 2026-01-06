import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { Expense } from "@/lib/types/expenses";

interface RecentExpensesTableProps {
  expenses?: Expense[];
}

export function RecentExpensesTable({
  expenses = [],
}: RecentExpensesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getValidationIcon = (expense: Expense) => {
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
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Últimos Gastos</h3>
        <Link
          href="/dashboard/expenses"
          className="text-sm text-primary hover:underline"
        >
          Ver todos
        </Link>
      </div>
      <div className="overflow-x-auto">
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
                    {formatDate(expense.fecha)}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium">
                    {formatCurrency(expense.total)}
                  </td>
                  <td className="py-3 px-2">{getValidationIcon(expense)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No hay gastos recientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

