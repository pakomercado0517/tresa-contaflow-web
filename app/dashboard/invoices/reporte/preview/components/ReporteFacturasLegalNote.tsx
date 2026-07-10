'use client';

import { Info } from 'lucide-react';

export function ReporteFacturasLegalNote() {
  return (
    <div className="mt-6 flex gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Info className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="font-semibold text-gray-900">Nota legal y fiscal</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          Este documento es una representación impresa de los CFDI considerados en el reporte.
          Las cifras son informativas y no sustituyen la conciliación bancaria ni la validación
          interna de la empresa. Generado por Contafy.
        </p>
      </div>
    </div>
  );
}
