"use client";

import Image from "next/image";
import { FileText, ArrowDownCircle, ArrowUpCircle, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReportGeneratedAtLine } from "@/components/common/ReportGeneratedAtLine";
import { formatDateNumeric } from "@/lib/utils/format";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export interface FilaIngresoDevengado {
  fecha: string;
  folioUuid: string;
  rfcReceptor: string;
  concepto: string;
  montoTotal: number;
}

export interface FilaEgresoDevengado {
  fecha: string;
  folioUuid: string;
  rfcEmisor: string;
  concepto: string;
  montoTotal: number;
}

export interface DetalleOperacionesDevengadasData {
  rfc: string;
  mes: number;
  año: number;
  ingresos: FilaIngresoDevengado[];
  egresos: FilaEgresoDevengado[];
  totalIngresos: number;
  totalEgresos: number;
  utilidadBruta: number;
  margenPercent: number;
  pageNumber: number;
  totalPages: number;
  /** URL del logo del despacho (branding en PDF) */
  logoUrl?: string | null;
  /** Nombre comercial del despacho (branding en PDF) */
  nombreComercial?: string | null;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function truncate(str: string, max: number): string {
  if (!str) return "—";
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}

function displayConcepto(concepto: string): string {
  const trimmed = concepto?.trim();
  return trimmed ? trimmed : "—";
}

/** Anchos fijos para que el concepto haga salto de línea sin invadir otras columnas (PDF/html2canvas). */
const DETALLE_TABLE_CLASS = "table-fixed w-full";

const TH_FECHA = "w-[11%] font-semibold text-gray-700";
const TH_FOLIO = "w-[22%] font-semibold text-gray-700";
const TH_RFC = "w-[16%] font-semibold text-gray-700";
const TH_CONCEPTO =
  "w-[36%] min-w-0 whitespace-normal font-semibold text-gray-700";
const TH_MONTO = "w-[15%] text-right font-semibold text-gray-700";

const TD_FECHA = "w-[11%] whitespace-nowrap text-gray-900";
const TD_FOLIO = "w-[22%] max-w-0 truncate font-mono text-xs text-gray-700";
const TD_RFC = "w-[16%] text-gray-700";
const TD_CONCEPTO =
  "report-detalle-concepto w-[36%] min-w-0 whitespace-normal break-words align-top text-gray-700";
const TD_MONTO = "w-[15%] whitespace-nowrap text-right font-medium text-gray-900";

interface DetalleOperacionesDevengadasTemplateProps {
  data: DetalleOperacionesDevengadasData;
  /** Ocultar footer durante captura PDF (jsPDF dibuja footer en cada página) */
  hideFooterForCapture?: boolean;
  className?: string;
}

export function DetalleOperacionesDevengadasTemplate({
  data,
  hideFooterForCapture = false,
  className,
}: DetalleOperacionesDevengadasTemplateProps) {
  const periodoTexto = `${MESES[data.mes - 1]} ${data.año}`;

  return (
    <article
      className={cn(
        "bg-white text-gray-900 shadow-none print:shadow-none",
        "max-w-[210mm] mx-auto print:break-before-page",
        className
      )}
      data-reporte-pagina-2
    >
      {/* Encabezado verde con branding del despacho */}
      <header className="flex items-center justify-between bg-emerald-600 px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          {data.logoUrl ? (
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
              <Image
                src={data.logoUrl}
                alt=""
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          ) : (
            <Eye className="h-5 w-5 shrink-0 text-white" />
          )}
          <span className="font-semibold">
            {data.nombreComercial || "Contafy Financial Analytics"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-sm">
          <p className="font-medium">RFC EMISOR: {data.rfc || "—"}</p>
          <p className="font-medium">PERIODO REPORTADO: {periodoTexto}</p>
        </div>
      </header>

      {/* Título principal */}
      <div className="border-b border-gray-200 px-6 pt-6 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Detalle de Operaciones Devengadas
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Desglose analítico de facturación emitida y recibida por fecha de emisión
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* INGRESOS DEVENGADOS (VENTAS) */}
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700">
            <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
            Ingresos devengados (ventas)
          </h2>
          <Table className={DETALLE_TABLE_CLASS}>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-100 hover:bg-gray-100">
                <TableHead className={TH_FECHA}>Fecha</TableHead>
                <TableHead className={TH_FOLIO}>Folio / UUID</TableHead>
                <TableHead className={TH_RFC}>RFC receptor</TableHead>
                <TableHead className={TH_CONCEPTO}>Concepto principal</TableHead>
                <TableHead className={TH_MONTO}>Monto total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ingresos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Sin registros
                  </TableCell>
                </TableRow>
              ) : (
                data.ingresos.map((row, idx) => (
                  <TableRow
                    key={row.folioUuid}
                    className={cn(
                      "border-gray-200",
                      idx % 2 === 1 && "bg-gray-50/80"
                    )}
                  >
                    <TableCell className={TD_FECHA}>{formatDateNumeric(row.fecha)}</TableCell>
                    <TableCell className={TD_FOLIO} title={row.folioUuid}>
                      {truncate(row.folioUuid, 20)}
                    </TableCell>
                    <TableCell className={TD_RFC}>{row.rfcReceptor || "—"}</TableCell>
                    <TableCell className={TD_CONCEPTO}>
                      {displayConcepto(row.concepto)}
                    </TableCell>
                    <TableCell className={TD_MONTO}>
                      {formatCurrency(row.montoTotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="border-0 bg-emerald-50">
                <TableCell
                  colSpan={4}
                  className="border-t border-emerald-100 py-2 font-semibold text-gray-800"
                >
                  Total ingresos devengados
                </TableCell>
                <TableCell className="border-t border-emerald-100 py-2 text-right font-bold text-emerald-700">
                  {formatCurrency(data.totalIngresos)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </section>

        {/* EGRESOS DEVENGADOS (GASTOS) */}
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700">
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
            Egresos devengados (gastos)
          </h2>
          <Table className={DETALLE_TABLE_CLASS}>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-100 hover:bg-gray-100">
                <TableHead className={TH_FECHA}>Fecha</TableHead>
                <TableHead className={TH_FOLIO}>Folio / UUID</TableHead>
                <TableHead className={TH_RFC}>RFC emisor</TableHead>
                <TableHead className={TH_CONCEPTO}>Concepto principal</TableHead>
                <TableHead className={TH_MONTO}>Monto total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.egresos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Sin registros
                  </TableCell>
                </TableRow>
              ) : (
                data.egresos.map((row, idx) => (
                  <TableRow
                    key={row.folioUuid}
                    className={cn(
                      "border-gray-200",
                      idx % 2 === 1 && "bg-gray-50/80"
                    )}
                  >
                    <TableCell className={TD_FECHA}>{formatDateNumeric(row.fecha)}</TableCell>
                    <TableCell className={TD_FOLIO} title={row.folioUuid}>
                      {truncate(row.folioUuid, 20)}
                    </TableCell>
                    <TableCell className={TD_RFC}>{row.rfcEmisor || "—"}</TableCell>
                    <TableCell className={TD_CONCEPTO}>
                      {displayConcepto(row.concepto)}
                    </TableCell>
                    <TableCell className={TD_MONTO}>
                      {formatCurrency(row.montoTotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="border-0 bg-red-50">
                <TableCell
                  colSpan={4}
                  className="border-t border-red-100 py-2 font-semibold text-gray-800"
                >
                  Total egresos devengados
                </TableCell>
                <TableCell className="border-t border-red-100 py-2 text-right font-bold text-red-700">
                  {formatCurrency(data.totalEgresos)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </section>

        {/* Utilidad bruta */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Utilidad bruta
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {formatCurrency(data.utilidadBruta)}
            </p>
            <p className="mt-1 text-sm text-gray-600">Margen: {data.margenPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Footer: oculto durante captura PDF (jsPDF dibuja footer en cada página) */}
      {!hideFooterForCapture && (
      <footer className="mt-8 border-t border-gray-200 bg-gray-50 px-6 py-4 text-xs text-gray-600" data-html-footer>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p>Generado por: Contafy</p>
            <ReportGeneratedAtLine />
          </div>
          <p className="max-w-md text-center md:text-right">
            Detalle extendido de operaciones devengadas para conciliación fiscal y contable.
          </p>
          <p className="text-right font-medium">
            Página {data.pageNumber} de {data.totalPages}
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
