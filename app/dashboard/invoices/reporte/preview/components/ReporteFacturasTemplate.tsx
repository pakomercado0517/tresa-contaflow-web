'use client';

import { type ReactNode } from 'react';
import { Building2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FilaFacturaReporte {
  fecha: string;
  folio: string;
  uuidCorto?: string;
  rfcReceptor: string;
  subtotal: number;
  impuestos: number;
  total: number;
}

export interface ReporteFacturasData {
  profileName: string;
  rfc: string;
  reportId: string;
  generatedDate: string;
  generatedTime: string;
  mes: number;
  año: number;
  periodoLabel: string;
  regimenFiscalLabel: string;
  estadoCfdi: string;
  totalIngresos: number;
  totalIvaTrasladado: number;
  totalRetencionesIva: number;
  totalRetencionesIsr: number;
  filas: FilaFacturaReporte[];
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface ReporteFacturasTemplateProps {
  data: ReporteFacturasData;
  headerAction?: ReactNode;
  hideHeaderForCapture?: boolean;
  hideFooterForCapture?: boolean;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
}

export function ReporteFacturasTemplate({
  data,
  headerAction,
  hideHeaderForCapture = false,
  hideFooterForCapture = false,
  pageNumber = 1,
  totalPages = 1,
  className,
}: ReporteFacturasTemplateProps) {
  const subtotalReporte = data.filas.reduce((s, f) => s + f.subtotal, 0);
  const impuestosReporte = data.filas.reduce((s, f) => s + f.impuestos, 0);
  const totalReporte = data.filas.reduce((s, f) => s + f.total, 0);

  return (
    <article
      className={cn(
        'bg-white text-gray-900 shadow-none print:shadow-none',
        'mx-auto max-w-[210mm]',
        className
      )}
      data-reporte-contenido
    >
      {!hideHeaderForCapture && (
        <header
          className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4"
          data-html-header
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{data.profileName}</p>
              <p className="text-sm text-gray-500">RFC: {data.rfc || '—'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white">
              ID REPORTE: {data.reportId}
            </span>
            <p className="text-xs text-gray-500">Generado: {data.generatedDate}</p>
            <p className="text-xs text-gray-500">Hora: {data.generatedTime}</p>
          </div>
          {headerAction}
        </header>
      )}

      <div className="px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              REPORTE DETALLADO DE FACTURAS
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span>TIPO:</span>
              <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                INGRESOS
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end text-right text-sm text-gray-600">
            <p className="font-medium text-gray-900">Período reportado: {data.periodoLabel}</p>
            <p className="mt-1 flex items-center justify-end gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Estado de CFDI: {data.estadoCfdi}
            </p>
          </div>
        </div>

        {/* Régimen fiscal + Retenciones IVA/ISR */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border border-gray-200 bg-gray-50/80">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Régimen fiscal
              </p>
              <p className="mt-1 font-medium text-gray-900">{data.regimenFiscalLabel}</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-gray-50/80">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Retenciones IVA
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(data.totalRetencionesIva)}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-gray-50/80">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Retenciones ISR
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(data.totalRetencionesIsr)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resumen numérico: ingresos e IVA trasladado */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border border-emerald-200 bg-emerald-50/60">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-gray-700 uppercase">
                Total ingresos CFDI
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {formatCurrency(data.totalIngresos)}
              </p>
              <p className="text-xs text-gray-600">MXN</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-gray-50/80">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                Total IVA trasladado
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(data.totalIvaTrasladado)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
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
              {data.filas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border-t border-gray-200 px-4 py-8 text-center text-gray-500"
                  >
                    Sin facturas en este período
                  </td>
                </tr>
              ) : (
                data.filas.map((fila, idx) => (
                  <tr
                    key={`${fila.folio}-${idx}`}
                    className={cn('border-t border-gray-100', idx % 2 === 1 && 'bg-gray-50/50')}
                  >
                    <td className="px-4 py-2.5 text-gray-900">{formatDate(fila.fecha)}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-gray-900">{fila.folio}</span>
                      {fila.uuidCorto && (
                        <span className="mt-0.5 block text-xs text-gray-500">{fila.uuidCorto}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                      {fila.rfcReceptor}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-900">
                      {formatCurrency(fila.subtotal)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-900">
                      {formatCurrency(fila.impuestos)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-emerald-700">
                      {formatCurrency(fila.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {data.filas.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-emerald-200 bg-emerald-50/40 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-gray-800">
                    Totales de reporte
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(subtotalReporte)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(impuestosReporte)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-700">
                    {formatCurrency(totalReporte)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Nota legal */}
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
      </div>

      {!hideFooterForCapture && (
        <footer
          className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4 text-xs text-gray-600"
          data-html-footer
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-600">
              <Building2 className="h-3 w-3" />
            </div>
            <p>
              Reporte generado por <span className="font-semibold text-emerald-700">Contafy</span>
            </p>
          </div>
          <p className="font-medium text-gray-700">
            Página {pageNumber} de {totalPages}
          </p>
        </footer>
      )}
    </article>
  );
}
