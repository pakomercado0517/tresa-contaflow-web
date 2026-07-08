'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Copy, FileText, Check } from 'lucide-react';
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
import { TableRowsSkeleton } from '@/components/common/skeletons/TableRowsSkeleton';
import { formatCurrency } from '@/lib/utils/format';
import type {
  ComplementRole,
  PaymentComplementListItem,
  PaymentComplementsPagination,
} from '@/lib/types/payment-complements';
import { ReconciliationBadge } from './ReconciliationBadge';

interface PaymentComplementsSectionProps {
  title: string;
  complementRole: ComplementRole;
  items: PaymentComplementListItem[];
  pagination: PaymentComplementsPagination;
  complementPage: number;
  onComplementPageChange: (page: number) => void;
  listState: 'idle' | 'loading' | 'updating' | 'error';
  errorMessage?: string;
  showProfileColumn: boolean;
  detailBasePath: '/dashboard/invoices/complementos' | '/dashboard/expenses/complementos';
  mes: number;
  año: number;
}

function truncateUuid(uuid: string): string {
  if (uuid.length <= 16) return uuid;
  return `${uuid.slice(0, 8)}…${uuid.slice(-8)}`;
}

function formatEmissionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CopyUuidButton({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      title="Copiar UUID"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function getCounterparty(item: PaymentComplementListItem, role: ComplementRole): string {
  if (role === 'INGRESO') {
    return item.rfc_receptor;
  }
  return item.rfc_emisor;
}

function buildDetailHref(
  basePath: PaymentComplementsSectionProps['detailBasePath'],
  complementId: string,
  profileId: string,
  mes: number,
  año: number
): string {
  const params = new URLSearchParams();
  params.set('profileId', profileId);
  params.set('mes', String(mes));
  params.set('año', String(año));
  return `${basePath}/${complementId}?${params.toString()}`;
}

export function PaymentComplementsSection({
  title,
  complementRole,
  items,
  pagination,
  complementPage,
  onComplementPageChange,
  listState,
  errorMessage,
  showProfileColumn,
  detailBasePath,
  mes,
  año,
}: PaymentComplementsSectionProps) {
  const isLoading = listState === 'loading';
  const isUpdating = listState === 'updating';

  return (
    <div className="bg-card min-w-0 overflow-hidden rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="text-muted-foreground text-sm font-medium">{title}</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Filtrado por fecha de pago del período ({mes}/{año}), alineado con métricas de flujo.
        </p>
      </div>

      {listState === 'error' && errorMessage ? (
        <div className="p-6">
          <p className="text-destructive text-sm">{errorMessage}</p>
        </div>
      ) : (
        <div className="relative min-w-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <TableRowsSkeleton rows={4} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No hay complementos con pagos en este período"
                description="Prueba otro mes o año, o sube un REP (complemento de pago) desde la carga de XML."
                variant="empty"
                compact
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-27.5">Emisión REP</TableHead>
                  <TableHead className="min-w-45">UUID</TableHead>
                  {showProfileColumn && <TableHead className="min-w-35">Perfil</TableHead>}
                  <TableHead className="min-w-30">Contraparte</TableHead>
                  <TableHead className="min-w-25 text-right">Total pagado</TableHead>
                  <TableHead className="min-w-35">Conciliación</TableHead>
                  <TableHead className="min-w-25 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.link_id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatEmissionDate(item.fecha_emision)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs" title={item.uuid}>
                          {truncateUuid(item.uuid)}
                        </span>
                        <CopyUuidButton uuid={item.uuid} />
                      </div>
                    </TableCell>
                    {showProfileColumn && (
                      <TableCell className="text-sm">
                        <p className="font-medium">{item.profile.nombre}</p>
                        <p className="text-muted-foreground text-xs">{item.profile.rfc}</p>
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-xs">{getCounterparty(item, complementRole)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(item.total_pagado)}
                    </TableCell>
                    <TableCell>
                      <ReconciliationBadge
                        cantidadItemsSinConciliar={item.cantidad_items_sin_conciliar}
                        cantidadFacturasRelacionadas={item.cantidad_facturas_relacionadas}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={buildDetailHref(
                            detailBasePath,
                            item.id,
                            item.profile_id,
                            mes,
                            año
                          )}
                        >
                          Ver detalle
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {isUpdating && items.length > 0 && (
            <div className="bg-background/90 absolute inset-0 backdrop-blur-[2px]">
              <TableRowsSkeleton rows={4} />
            </div>
          )}
        </div>
      )}

      {pagination.totalPages > 1 && listState !== 'error' && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Mostrando {(complementPage - 1) * pagination.limit + 1}-
            {Math.min(complementPage * pagination.limit, pagination.total)} de {pagination.total}{' '}
            complementos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComplementPageChange(complementPage - 1)}
              disabled={complementPage === 1}
            >
              ←
            </Button>
            <span className="text-muted-foreground text-sm">
              {complementPage} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComplementPageChange(complementPage + 1)}
              disabled={complementPage === pagination.totalPages}
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
