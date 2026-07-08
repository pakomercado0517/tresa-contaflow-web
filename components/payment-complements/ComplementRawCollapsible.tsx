'use client';

import type { ComplementoPago } from '@/lib/types/payment-complements';

interface ComplementRawCollapsibleProps {
  complementoData: ComplementoPago;
}

export function ComplementRawCollapsible({ complementoData }: ComplementRawCollapsibleProps) {
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
        Datos del complemento (avanzado)
      </summary>
      <pre className="text-muted-foreground max-h-80 overflow-auto border-t p-4 text-xs">
        {JSON.stringify(complementoData, null, 2)}
      </pre>
    </details>
  );
}
