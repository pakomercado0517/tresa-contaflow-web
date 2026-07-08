'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { PaymentComplementItemRow } from '@/lib/types/payment-complements';

interface RelatedDocumentLinkProps {
  item: PaymentComplementItemRow;
  profileId: string | undefined;
  mes: number;
  año: number;
  listBasePath: '/dashboard/invoices' | '/dashboard/expenses';
}

function buildListSearchHref(
  basePath: RelatedDocumentLinkProps['listBasePath'],
  profileId: string | undefined,
  mes: number,
  año: number,
  searchUuid: string
): string {
  const params = new URLSearchParams();
  if (profileId) params.set('profileId', profileId);
  params.set('mes', String(mes));
  params.set('año', String(año));
  params.set('search', searchUuid);
  params.set('page', '1');
  return `${basePath}?${params.toString()}`;
}

export function RelatedDocumentLink({
  item,
  profileId,
  mes,
  año,
  listBasePath,
}: RelatedDocumentLinkProps) {
  if (!item.conciliado) {
    return (
      <Badge variant="secondary" className="font-normal">
        Sin factura/gasto PPD en el sistema
      </Badge>
    );
  }

  const href = buildListSearchHref(listBasePath, profileId, mes, año, item.factura_uuid);
  const label =
    item.documento_relacionado_tipo === 'expense' ? 'Ver gasto PPD' : 'Ver factura PPD';

  return (
    <Link href={href} className="text-primary text-sm font-medium hover:underline">
      {label}
    </Link>
  );
}
