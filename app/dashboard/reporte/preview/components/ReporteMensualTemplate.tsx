'use client';

import { type ReactNode } from 'react';
import Image from 'next/image';
import { BarChart3, Building2, DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Estado de resultados por régimen fiscal (una fila por régimen del perfil) */
export interface EstadoPorRegimen {
  /** Nombre o descripción del régimen (ej. "Régimen de Actividades Profesionales") */
  nombreRegimen: string;
  /** Ingresos devengados del régimen */
  ingresos: number;
  /** Egresos devengados del régimen (valor positivo; en pantalla se muestran entre paréntesis) */
  egresos: number;
  /** Retenciones de IVA aplicadas en el régimen */
  retencionesIva: number;
  /** Retenciones de ISR aplicadas en el régimen */
  retencionesIsr: number;
  /** Impuesto trasladado (IVA trasladado) del régimen */
  impuestoTrasladado: number;
  /** Utilidad neta del régimen */
  utilidadNeta: number;
}

export interface ReporteMensualData {
  profileName: string;
  rfc: string;
  mes: number;
  año: number;
  /** Ingresos cobrados (flujo caja) */
  ingresosCobrados: number;
  /** Egresos pagados (flujo caja) */
  egresosPagados: number;
  /** Flujo neto */
  flujoNeto: number;
  /** Facturas por cobrar */
  facturasPorCobrar: number;
  /** Facturas por pagar */
  facturasPorPagar: number;
  /** Proyección saldo bancario (ej. flujo neto o saldo proyectado) */
  proyeccionSaldo: number;
  /** Ingresos devengados (ventas totales) */
  ingresosDevengados: number;
  /** Egresos devengados (costos y gastos) */
  egresosDevengados: number;
  /** Utilidad operativa */
  utilidadOperativa: number;
  /** Variación % ingresos vs mes anterior (opcional) */
  variacionIngresos?: number;
  /** Variación % egresos vs mes anterior (opcional) */
  variacionEgresos?: number;
  /** Estado de resultados desglosado por régimen fiscal (si existe, se muestra esta sección en lugar del bloque único) */
  estadoPorRegimen?: EstadoPorRegimen[];
  /** URL del logo del despacho (branding en PDF) */
  logoUrl?: string | null;
  /** Nombre comercial del despacho (branding en PDF) */
  nombreComercial?: string | null;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

interface ReporteMensualTemplateProps {
  data: ReporteMensualData;
  /** Acción del header (ej. botón Descargar PDF). No renderizar durante captura PDF. */
  headerAction?: ReactNode;
  /** Ocultar encabezado durante captura PDF (para que no aparezca en el PDF) */
  hideHeaderForCapture?: boolean;
  /** Ocultar footer durante captura PDF (se dibuja con jsPDF en cada página) */
  hideFooterForCapture?: boolean;
  /** Número de página actual (para footer "Página X de Y") */
  pageNumber?: number;
  /** Total de páginas del reporte */
  totalPages?: number;
  className?: string;
}

export function ReporteMensualTemplate({
  data,
  headerAction,
  hideHeaderForCapture = false,
  hideFooterForCapture = false,
  pageNumber = 1,
  totalPages = 1,
  className,
}: ReporteMensualTemplateProps) {
  const margen =
    data.ingresosDevengados > 0 ? (data.utilidadOperativa / data.ingresosDevengados) * 100 : 0;

  const maxTesorería = Math.max(data.facturasPorCobrar, data.facturasPorPagar, 1);
  const progressCobrar = maxTesorería > 0 ? (data.facturasPorCobrar / maxTesorería) * 100 : 0;
  const progressPagar = maxTesorería > 0 ? (data.facturasPorPagar / maxTesorería) * 100 : 0;

  return (
    <article
      className={cn(
        'bg-white text-gray-900 shadow-none print:shadow-none',
        'mx-auto max-w-[210mm]',
        className
      )}
      data-reporte-contenido
    >
      {/* Header: oculto durante captura PDF para que no aparezca en el documento */}
      {!hideHeaderForCapture && (
        <header
          className="flex items-center justify-between border-b border-gray-200 px-6 py-4"
          data-html-header
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Portal de Reportes Contafy</span>
          </div>
          {headerAction}
        </header>
      )}

      {/* Bloque superior: tarjeta empresa (logo + nombre comercial) + tarjeta reporte */}
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <Card className="overflow-visible border border-gray-200 bg-gray-50/80 shadow-sm">
          <CardHeader className="pb-2">
            {data.logoUrl ? (
              <div className="-mt-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow">
                <Image
                  src={data.logoUrl}
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="-mt-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow">
                <DollarSign className="h-6 w-6" />
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {data.nombreComercial ? (
              <>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  {data.nombreComercial}
                </h2>
                <p className="mt-0.5 text-xs font-medium tracking-wide text-gray-500">
                  Generado con Contafy
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-emerald-700">Contafy</h2>
                <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                  FINANCIAL ANALYTICS
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-emerald-600 text-white shadow-sm">
          <div
            className="absolute top-0 left-0 h-24 w-24 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                rgba(255,255,255,0.3) 4px,
                rgba(255,255,255,0.3) 8px
              )`,
            }}
          />
          <CardContent className="relative p-6">
            <p className="text-sm font-medium text-emerald-100">Reporte Mensual de Operaciones</p>
            <p className="mt-2 text-2xl font-bold">RFC: {data.rfc || '—'}</p>
            <p className="mt-1 text-emerald-100">
              Periodo: {MESES[data.mes - 1]} {data.año}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RESUMEN DE FLUJO (CAJA) */}
      <section className="px-6 pb-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
          <BarChart3 className="h-4 w-4" />
          Resumen de flujo (caja)
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
                Ingresos cobrados
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(data.ingresosCobrados)}
              </p>
              {data.variacionIngresos != null && (
                <p
                  className={cn(
                    'mt-1 flex items-center gap-1 text-sm',
                    data.variacionIngresos >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {data.variacionIngresos >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatPercent(data.variacionIngresos)} vs mes ant.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-amber-600 uppercase">
                Egresos pagados
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(data.egresosPagados)}
              </p>
              {data.variacionEgresos != null && (
                <p
                  className={cn(
                    'mt-1 flex items-center gap-1 text-sm',
                    data.variacionEgresos <= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {data.variacionEgresos <= 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  {formatPercent(data.variacionEgresos)} vs mes ant.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-emerald-200 bg-emerald-50/60">
            <CardContent className="p-4">
              <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                Flujo neto
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {formatCurrency(data.flujoNeto)}
              </p>
              <p className="mt-1 text-sm text-gray-600">Liquidez disponible</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* TESORERÍA PENDIENTE */}
      <section className="px-6 pb-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
          <Wallet className="h-4 w-4" />
          Tesorería pendiente
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600">Facturas por cobrar</span>
            <div className="flex flex-1 items-center gap-4 sm:max-w-xs">
              <Progress
                value={Math.min(progressCobrar, 100)}
                className="h-2 flex-1 bg-emerald-100 [&>div]:bg-emerald-600"
              />
              <span className="w-28 shrink-0 text-right font-medium text-gray-900">
                {formatCurrency(data.facturasPorCobrar)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600">Facturas por pagar</span>
            <div className="flex flex-1 items-center gap-4 sm:max-w-xs">
              <Progress
                value={Math.min(progressPagar, 100)}
                className="h-2 flex-1 bg-red-100 [&>div]:bg-red-500"
              />
              <span className="w-28 shrink-0 text-right font-medium text-gray-900">
                {formatCurrency(data.facturasPorPagar)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600">Proyección saldo bancario</span>
            <span className="w-28 shrink-0 text-right font-medium text-gray-900">
              {formatCurrency(data.proyeccionSaldo)}
            </span>
          </div>
        </div>
      </section>

      {/* COMPARATIVA COBRADO VS PAGADO */}
      <section className="px-6 pb-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
          <BarChart3 className="h-4 w-4" />
          Comparativa cobrado vs pagado
        </h3>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            Cobros: {formatCurrency(data.ingresosCobrados)}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gray-400" />
            Pagos: {formatCurrency(data.egresosPagados)}
          </span>
        </div>
      </section>

      {/* ESTADO DE RESULTADOS POR REGIMEN: regímenes en flujo continuo dentro del article */}
      {data.estadoPorRegimen && data.estadoPorRegimen.length > 0 && (
        <section className="px-6 pb-6" data-reporte-seccion-regimenes>
          <div className="space-y-6">
            {data.estadoPorRegimen.map((regimen, index) => (
              <div key={index} data-reporte-regimen className={index === 0 ? '' : ''}>
                {/* Título de sección incluido en el primer régimen para que el
                    salto de página ocurra antes del título, no entre título y card */}
                {index === 0 && (
                  <div className="mb-4 pt-10">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
                      <BarChart3 className="h-4 w-4" />
                      Estado de resultados por régimen
                    </h3>
                    <span className="mb-4 block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      Basado en fecha de emisión CFDI
                    </span>
                  </div>
                )}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50">
                  <div className="border-b border-gray-200 bg-gray-100 px-4 py-2.5">
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                    <h4 className="text-sm font-bold text-gray-900">{regimen.nombreRegimen}</h4>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ingresos (cobrados / devengados)</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(regimen.ingresos)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Egresos (pagados / deducidos)</span>
                      <span className="font-medium text-red-600">
                        ({formatCurrency(regimen.egresos)})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Retenciones de terceros (IVA)</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(regimen.retencionesIva)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Retenciones de terceros (ISR)</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(regimen.retencionesIsr)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impuesto trasladado</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(regimen.impuestoTrasladado)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3">
                      <span className="font-bold text-emerald-700">Utilidad neta del régimen</span>
                      <span className="text-lg font-bold text-emerald-700">
                        {formatCurrency(regimen.utilidadNeta)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ESTADO DE RESULTADOS (MODELO DEVENGADO) - bloque único cuando no hay desglose por régimen */}
      {(!data.estadoPorRegimen || data.estadoPorRegimen.length === 0) && (
        <section className="px-6 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
              <BarChart3 className="h-4 w-4" />
              Estado de resultados (modelo devengado)
            </h3>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              Basado en fecha de emisión CFDI
            </span>
          </div>
          <div className="mt-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ingresos devengados (ventas totales)</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(data.ingresosDevengados)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Egresos devengados (costos y gastos)</span>
              <span className="font-medium text-gray-900">
                ({formatCurrency(data.egresosDevengados)})
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="font-bold text-emerald-700">Utilidad operativa</span>
                <span className="text-xl font-bold text-emerald-700">
                  {formatCurrency(data.utilidadOperativa)}
                </span>
              </div>
              <p className="mt-1 text-right text-sm text-gray-500">
                Margen de operación: {margen.toFixed(1)}%
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer: oculto durante captura PDF (jsPDF dibuja footer en cada página) */}
      {!hideFooterForCapture && (
        <footer
          className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-xs text-gray-600"
          data-html-footer
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p>Generado por: Contafy</p>
              <p suppressHydrationWarning>
                Fecha de generación:{' '}
                {new Date().toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
            <p className="max-w-md text-center md:text-right">
              Este documento es para fines informativos y de gestión interna. Sujeto a cambios
              basados en conciliaciones bancarias.
            </p>
            <p className="text-right font-medium">
              Página {pageNumber} de {totalPages}
            </p>
          </div>
          <p className="mt-2 text-center text-gray-500" suppressHydrationWarning>
            © {new Date().getFullYear()} Contafy - Aviso de privacidad y términos de servicio
            aplicables.
          </p>
        </footer>
      )}
    </article>
  );
}
