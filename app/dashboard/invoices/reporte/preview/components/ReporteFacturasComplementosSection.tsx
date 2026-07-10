'use client';

import { cn } from '@/lib/utils';
import {
  formatReporteFacturasCurrency,
  formatReporteFacturasDate,
} from './reporte-facturas-format';
import type { FilaComplementoReporte } from './reporte-facturas-types';

interface ReporteFacturasComplementosSectionProps {
  mes: number;
  año: number;
  filasComplementos: FilaComplementoReporte[];
  showComplementProfileColumn?: boolean;
}

export function ReporteFacturasComplementosSection({
  mes,
  año,
  filasComplementos,
  showComplementProfileColumn,
}: ReporteFacturasComplementosSectionProps) {
  return (
    <div className="mt-6" data-reporte-regimen>
      <h2 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
        Complementos de cobro (REP emitidos)
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        Filtrado por fecha de pago del período ({mes}/{año}), alineado con métricas de
        flujo.
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="px-2 py-1.5 text-left font-semibold">Emisión REP</th>
              <th className="px-2 py-1.5 text-left font-semibold">UUID</th>
              {showComplementProfileColumn && (
                <th className="px-2 py-1.5 text-left font-semibold">Perfil</th>
              )}
              <th className="px-2 py-1.5 text-left font-semibold">Contraparte</th>
              <th className="px-2 py-1.5 text-right font-semibold">Total pagado</th>
              <th className="px-2 py-1.5 text-left font-semibold">Conciliación</th>
            </tr>
          </thead>
          <tbody>
            {filasComplementos.length === 0 ? (
              <tr>
                <td
                  colSpan={showComplementProfileColumn ? 6 : 5}
                  className="border-t border-gray-200 px-2 py-6 text-center text-gray-500"
                >
                  Sin complementos con pagos en este período
                </td>
              </tr>
            ) : (
              filasComplementos.map((fila, idx) => (
                <tr
                  key={fila.linkId}
                  className={cn(
                    'border-t border-gray-100',
                    idx % 2 === 1 && 'bg-gray-50/50'
                  )}
                >
                  <td className="whitespace-nowrap px-2 py-1.5 text-gray-900">
                    {formatReporteFacturasDate(fila.fechaEmision)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-gray-700">{fila.uuidCorto}</td>
                  {showComplementProfileColumn && (
                    <td className="px-2 py-1.5 text-gray-700">
                      <span className="block font-medium text-gray-900">
                        {fila.perfilNombre ?? '—'}
                      </span>
                      {fila.perfilRfc && (
                        <span className="block font-mono text-[10px] text-gray-500">
                          {fila.perfilRfc}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-2 py-1.5 font-mono text-gray-700">
                    {fila.rfcContraparte}
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium tabular-nums text-emerald-700">
                    {formatReporteFacturasCurrency(fila.totalPagado)}
                  </td>
                  <td className="px-2 py-1.5 text-gray-700">{fila.conciliacionLabel}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
