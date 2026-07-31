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
import type { Invoice } from '@/lib/types/invoices';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { getInvoiceStatusBadge } from './invoices-list-display-utils';

interface InvoicesXmlTableSectionProps {
  invoices: Invoice[];
  search: string;
  tableState: 'idle' | 'loading' | 'updating';
  onDelete: (invoice: Invoice) => void;
}

function InvoicesEmptyState({ search }: { search: string }) {
  return (
    <EmptyState
      icon={FileX}
      title={
        search
          ? `No se encontraron facturas que coincidan con "${search}"`
          : 'No se encontraron facturas'
      }
      description={
        search
          ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
          : 'Comienza subiendo archivos XML de facturas'
      }
      actionLabel={search ? undefined : 'Subir Facturas'}
      actionHref={search ? undefined : '/dashboard/invoices/upload'}
      variant="search"
      compact
    />
  );
}

function InvoiceDeleteButton({
  invoice,
  onDelete,
}: {
  invoice: Invoice;
  onDelete: (invoice: Invoice) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title="Eliminar factura"
      onClick={() => onDelete(invoice)}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function InvoicesXmlTableSection({
  invoices,
  search,
  tableState,
  onDelete,
}: InvoicesXmlTableSectionProps) {
  return (
    <div
      data-tour="invoices-table"
      className="bg-card relative min-w-0 overflow-hidden rounded-lg border"
    >
      <DashboardListMobile className="p-3">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <DashboardListItemCard
              key={invoice.id}
              title={
                <p className="truncate" title={invoice.nombre_emisor}>
                  {invoice.nombre_emisor}
                </p>
              }
              subtitle={
                <div className="space-y-0.5">
                  <p>RFC: {invoice.rfc_emisor}</p>
                  <p className="font-mono" title={invoice.uuid}>
                    {invoice.uuid || `F-${invoice.id.slice(-4)}`}
                  </p>
                </div>
              }
              badge={getInvoiceStatusBadge(invoice)}
              meta={formatDateTime(invoice.fecha)}
              amount={formatCurrency(invoice.subtotal)}
              fields={[
                {
                  label: 'IVA Trasl.',
                  value: formatCurrency(invoice.iva_amount ?? invoice.iva ?? 0),
                },
                {
                  label: 'Ret. IVA',
                  value: formatCurrency(invoice.retencion_iva_amount ?? 0),
                },
                {
                  label: 'Ret. ISR',
                  value: formatCurrency(invoice.retencion_isr_amount ?? 0),
                },
                {
                  label: 'Receptor',
                  value: (
                    <span className="block truncate" title={invoice.nombre_receptor}>
                      {invoice.nombre_receptor}
                    </span>
                  ),
                },
              ]}
              actions={<InvoiceDeleteButton invoice={invoice} onDelete={onDelete} />}
            />
          ))
        ) : (
          <div className="py-4">
            <InvoicesEmptyState search={search} />
          </div>
        )}
      </DashboardListMobile>

      <DashboardListDesktop>
        <div className="relative max-h-150 overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead className="min-w-50">UUID / FOLIO</TableHead>
                <TableHead className="min-w-37.5">FECHA</TableHead>
                <TableHead className="min-w-50">EMISOR</TableHead>
                <TableHead className="min-w-50">RECEPTOR</TableHead>
                <TableHead className="min-w-27.5 text-right">MONTO</TableHead>
                <TableHead className="min-w-25 text-right">IVA TRASL.</TableHead>
                <TableHead className="min-w-25 text-right">RET. IVA</TableHead>
                <TableHead className="min-w-25 text-right">RET. ISR</TableHead>
                <TableHead className="min-w-25">ESTADO</TableHead>
                <TableHead className="min-w-25 text-right">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="max-w-50 truncate" title={invoice.uuid}>
                        {invoice.uuid || `F-${invoice.id.slice(-4)}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateTime(invoice.fecha)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-50">
                        <p className="truncate text-sm font-medium" title={invoice.nombre_emisor}>
                          {invoice.nombre_emisor}
                        </p>
                        <p className="text-muted-foreground text-xs">{invoice.rfc_emisor}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-50">
                        <p
                          className="truncate text-sm font-medium"
                          title={invoice.nombre_receptor}
                        >
                          {invoice.nombre_receptor}
                        </p>
                        <p className="text-muted-foreground text-xs">{invoice.rfc_receptor}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                      {formatCurrency(invoice.subtotal)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                      {formatCurrency(invoice.iva_amount ?? invoice.iva ?? 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                      {formatCurrency(invoice.retencion_iva_amount ?? 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                      {formatCurrency(invoice.retencion_isr_amount ?? 0)}
                    </TableCell>
                    <TableCell>{getInvoiceStatusBadge(invoice)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <InvoiceDeleteButton invoice={invoice} onDelete={onDelete} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="py-8">
                    <InvoicesEmptyState search={search} />
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
