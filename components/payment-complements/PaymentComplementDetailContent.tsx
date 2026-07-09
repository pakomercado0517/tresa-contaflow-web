'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import type { ComplementRole, PaymentComplementDetail } from '@/lib/types/payment-complements';
import { PaymentComplementItemsTable } from './PaymentComplementItemsTable';
import { ComplementRawCollapsible } from './ComplementRawCollapsible';
import { ReconciliationBadge } from './ReconciliationBadge';

interface PaymentComplementDetailContentProps {
  detail: PaymentComplementDetail;
  complementRole: ComplementRole;
  profileId: string | undefined;
  mes: number;
  año: number;
  listBasePath: '/dashboard/invoices' | '/dashboard/expenses';
  listHref: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PaymentComplementDetailContent({
  detail,
  complementRole,
  profileId,
  mes,
  año,
  listBasePath,
  listHref,
}: PaymentComplementDetailContentProps) {
  const roleLabel = complementRole === 'INGRESO' ? 'Cobro (REP emitido)' : 'Pago (REP recibido)';

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href={listHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Link>
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">Complemento de pago</h1>
          <Badge variant="outline">{roleLabel}</Badge>
        </div>
        <p className="text-muted-foreground font-mono text-sm break-all">{detail.uuid}</p>
      </div>

      <div className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Emisión</p>
          <p className="text-sm font-medium">{formatDate(detail.fecha_emision)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Emisor</p>
          <p className="font-mono text-sm">{detail.rfc_emisor}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Receptor</p>
          <p className="font-mono text-sm">{detail.rfc_receptor}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Total pagado (período)</p>
          <p className="text-lg font-semibold tabular-nums">{formatCurrency(detail.total_pagado)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <ReconciliationBadge
          cantidadItemsSinConciliar={detail.cantidad_items_sin_conciliar}
          cantidadFacturasRelacionadas={detail.cantidad_facturas_relacionadas}
        />
        {detail.profile && (
          <p className="text-muted-foreground text-sm">
            Perfil: {detail.profile.nombre} ({detail.profile.rfc})
          </p>
        )}
      </div>

      <div className="bg-card overflow-hidden rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-medium">Líneas de pago</h2>
        </div>
        <PaymentComplementItemsTable
          items={detail.items}
          profileId={profileId ?? detail.profile_id}
          mes={mes}
          año={año}
          listBasePath={listBasePath}
        />
      </div>

      <ComplementRawCollapsible complementoData={detail.complemento_data} />
    </div>
  );
}
