import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import type { Invoice } from '@/lib/types/invoices';
import { formatCurrency, formatDateShort } from '@/lib/utils/format';

interface RecentInvoicesTableProps {
  invoices?: Invoice[];
}

function getStatusBadge(invoice: Invoice) {
  if (invoice.tipo === 'PUE') {
    return <Badge className="bg-green-500 text-white">Pagado</Badge>;
  }

  if (invoice.tipo === 'PPD') {
    const estadoPago = invoice.estadoPago;

    if (!estadoPago) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          No Pagado
        </Badge>
      );
    }

    if (estadoPago.completamentePagado || estadoPago.estado === 'PAGADO') {
      return <Badge className="bg-green-500 text-white">Pagado</Badge>;
    }

    if (estadoPago.estado === 'PAGO_PARCIAL' || estadoPago.porcentajePagado > 0) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          Parcial ({Math.round(estadoPago.porcentajePagado)}%)
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-orange-500 text-orange-600">
        No Pagado
      </Badge>
    );
  }

  return <Badge variant="outline">Pago</Badge>;
}

function RecentInvoicesEmptyState() {
  return (
    <EmptyState
      icon={FileText}
      title="No hay facturas recientes"
      description="Las facturas que subas aparecerán aquí"
      actionLabel="Ver todas las facturas"
      actionHref="/dashboard/invoices"
      variant="search"
      compact
    />
  );
}

function RecentInvoiceItemCard({ invoice }: { invoice: Invoice }) {
  return (
    <article className="border-border bg-muted/30 space-y-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium">{invoice.nombre_emisor}</p>
          <p className="text-muted-foreground text-xs">RFC: {invoice.rfc_emisor}</p>
        </div>
        {getStatusBadge(invoice)}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{formatDateShort(invoice.fecha)}</p>
        <p className="text-sm font-semibold">{formatCurrency(invoice.total)}</p>
      </div>
    </article>
  );
}

export function RecentInvoicesTable({ invoices = [] }: RecentInvoicesTableProps) {
  const recentInvoices = invoices.slice(0, 3);

  return (
    <Card
      data-tour="recent-invoices"
      className="border-border bg-card min-w-0 overflow-hidden p-4 md:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Últimos Ingresos</h3>
        <Link href="/dashboard/invoices" className="text-primary text-sm hover:underline">
          Ver todos
        </Link>
      </div>

      {/* Lista en cards — móvil */}
      <div className="space-y-3 md:hidden">
        {recentInvoices.length > 0 ? (
          recentInvoices.map((invoice) => (
            <RecentInvoiceItemCard key={invoice.id} invoice={invoice} />
          ))
        ) : (
          <div className="py-4">
            <RecentInvoicesEmptyState />
          </div>
        )}
      </div>

      {/* Tabla — desktop */}
      <div className="hidden min-w-0 overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-border border-b">
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                EMPRESA / RFC
              </th>
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                FECHA
              </th>
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                MONTO
              </th>
              <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                ESTATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-border hover:bg-muted/50 border-b">
                  <td className="px-2 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{invoice.nombre_emisor}</p>
                      <p className="text-muted-foreground text-xs">RFC: {invoice.rfc_emisor}</p>
                    </div>
                  </td>
                  <td className="text-muted-foreground px-2 py-3 text-sm">
                    {formatDateShort(invoice.fecha)}
                  </td>
                  <td className="px-2 py-3 text-sm font-medium">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="px-2 py-3">{getStatusBadge(invoice)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8">
                  <RecentInvoicesEmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
