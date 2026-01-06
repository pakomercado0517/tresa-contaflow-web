import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/lib/types/invoices";

interface RecentInvoicesTableProps {
  invoices?: Invoice[];
}

export function RecentInvoicesTable({
  invoices = [],
}: RecentInvoicesTableProps) {
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

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.tipo === "PUE") {
      return (
        <Badge className="bg-primary text-primary-foreground">Timbrada</Badge>
      );
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Últimos Ingresos</h3>
        <Link
          href="/invoices"
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
                EMPRESA / RFC
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                FECHA
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                MONTO
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                ESTATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.slice(0, 3).map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="py-3 px-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{invoice.nombre_emisor}</p>
                      <p className="text-xs text-muted-foreground">
                        RFC: {invoice.rfc_emisor}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {formatDate(invoice.fecha)}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="py-3 px-2">{getStatusBadge(invoice)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No hay facturas recientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

