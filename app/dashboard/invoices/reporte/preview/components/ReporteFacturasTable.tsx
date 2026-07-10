'use client';

import { cn } from '@/lib/utils';
import {
  formatReporteFacturasCurrency,
  formatReporteFacturasDate,
} from './reporte-facturas-format';
import type { FilaFacturaReporte } from './reporte-facturas-types';

interface ReporteFacturasTableProps {
  filas: FilaFacturaReporte[];
}

export function ReporteFacturasTable({ filas }: ReporteFacturasTableProps) {
  const subtotalReporte = filas.reduce((s, f) => s + f.subtotal, 0);
  const impuestosReporte = filas.reduce((s, f) => s + f.impuestos, 0);
  const totalReporte = filas.reduce((s, f) => s + f.total, 0);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-emerald-600 text-white">
            <th className="px-4 py-3 text-left font-semibold">Fecha</th>
            <th className="px-4 py-3 text-left font-semibold">Folio CFDI</th>
            <th className="px-4 py-3 text-left font-semibold">RFC receptor</th>
            <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
            <th className="px-4 py-3 text-right font-semibold">Impuestos</th>
            <th className="px-4 py-3 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="border-t border-gray-200 px-4 py-8 text-center text-gray-500"
              >
                Sin facturas en este período
              </td>
            </tr>
          ) : (
            filas.map((fila, idx) => (
              <tr
                key={`${fila.folio}-${fila.fecha}-${fila.rfcReceptor}`}
                className={cn('border-t border-gray-100', idx % 2 === 1 && 'bg-gray-50/50')}
              >
                <td className="px-4 py-2.5 text-gray-900">
                  {formatReporteFacturasDate(fila.fecha)}
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-medium text-gray-900">{fila.folio}</span>
                  {fila.uuidCorto && (
                    <span className="mt-0.5 block text-xs text-gray-500">{fila.uuidCorto}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{fila.rfcReceptor}</td>
                <td className="px-4 py-2.5 text-right text-gray-900">
                  {formatReporteFacturasCurrency(fila.subtotal)}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-900">
                  {formatReporteFacturasCurrency(fila.impuestos)}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-emerald-700">
                  {formatReporteFacturasCurrency(fila.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
        {filas.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-emerald-200 bg-emerald-50/40 font-semibold">
              <td colSpan={3} className="px-4 py-3 text-gray-800">
                Totales de reporte
              </td>
              <td className="px-4 py-3 text-right text-gray-900">
                {formatReporteFacturasCurrency(subtotalReporte)}
              </td>
              <td className="px-4 py-3 text-right text-gray-900">
                {formatReporteFacturasCurrency(impuestosReporte)}
              </td>
              <td className="px-4 py-3 text-right text-emerald-700">
                {formatReporteFacturasCurrency(totalReporte)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
