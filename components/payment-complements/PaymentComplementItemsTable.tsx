'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/lib/utils/format';
import type { PaymentComplementItemRow } from '@/lib/types/payment-complements';
import { RelatedDocumentLink } from './RelatedDocumentLink';

interface PaymentComplementItemsTableProps {
  items: PaymentComplementItemRow[];
  profileId: string | undefined;
  mes: number;
  año: number;
  listBasePath: '/dashboard/invoices' | '/dashboard/expenses';
}

export function PaymentComplementItemsTable({
  items,
  profileId,
  mes,
  año,
  listBasePath,
}: PaymentComplementItemsTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground p-6 text-sm">
        No hay líneas de pago en el período seleccionado.
      </p>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-45">UUID factura</TableHead>
            <TableHead className="min-w-22.5">Parcialidad</TableHead>
            <TableHead className="min-w-27.5">Fecha pago</TableHead>
            <TableHead className="min-w-25 text-right">Imp. pagado</TableHead>
            <TableHead className="min-w-25 text-right">Saldo ant.</TableHead>
            <TableHead className="min-w-25 text-right">Saldo insoluto</TableHead>
            <TableHead className="min-w-35">Conciliación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">
                <span className="block max-w-45 truncate" title={item.factura_uuid}>
                  {item.factura_uuid}
                </span>
              </TableCell>
              <TableCell>{item.num_parcialidad}</TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {formatDateShort(item.fecha_pago)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(item.imp_pagado)}
              </TableCell>
              <TableCell className="text-muted-foreground text-right tabular-nums">
                {formatCurrency(item.imp_saldo_ant)}
              </TableCell>
              <TableCell className="text-muted-foreground text-right tabular-nums">
                {formatCurrency(item.imp_saldo_insoluto)}
              </TableCell>
              <TableCell>
                <RelatedDocumentLink
                  item={item}
                  profileId={profileId}
                  mes={mes}
                  año={año}
                  listBasePath={listBasePath}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
