import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
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
    // Para facturas PUE, siempre están pagadas
    if (invoice.tipo === "PUE") {
      return (
        <Badge className="bg-green-500 text-white">Pagado</Badge>
      );
    }

    // Para facturas PPD, verificar estado de pago
    if (invoice.tipo === "PPD") {
      const estadoPago = invoice.estadoPago;

      // Si no hay estadoPago, considerar como no pagado
      if (!estadoPago) {
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            No Pagado
          </Badge>
        );
      }

      // Si está completamente pagado
      if (estadoPago.completamentePagado || estadoPago.estado === 'PAGADO') {
        return (
          <Badge className="bg-green-500 text-white">Pagado</Badge>
        );
      }

      // Si tiene pago parcial
      if (estadoPago.estado === 'PAGO_PARCIAL' || estadoPago.porcentajePagado > 0) {
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Parcial ({Math.round(estadoPago.porcentajePagado)}%)
          </Badge>
        );
      }

      // Si no está pagado
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          No Pagado
        </Badge>
      );
    }

    // Para complementos de pago
    return <Badge variant="outline">Pago</Badge>;
  };

  return (
    <Card data-tour="recent-invoices" className="min-w-0 overflow-hidden p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Últimos Ingresos</h3>
        <Link
          href="/dashboard/invoices"
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
                <td colSpan={4} className="py-8">
                  <EmptyState
                    icon={FileText}
                    title="No hay facturas recientes"
                    description="Las facturas que subas aparecerán aquí"
                    actionLabel="Ver todas las facturas"
                    actionHref="/dashboard/invoices"
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

