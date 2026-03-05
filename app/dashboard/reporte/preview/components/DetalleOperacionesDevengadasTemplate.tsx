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

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function truncate(str: string, max: number): string {
  if (!str) return "—";
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}

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
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-100 hover:bg-gray-100">
                <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                <TableHead className="font-semibold text-gray-700">Folio / UUID</TableHead>
                <TableHead className="font-semibold text-gray-700">RFC receptor</TableHead>
                <TableHead className="font-semibold text-gray-700">Concepto principal</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Monto total</TableHead>
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
                    key={`ing-${idx}-${row.folioUuid}`}
                    className={cn(
                      "border-gray-200",
                      idx % 2 === 1 && "bg-gray-50/80"
                    )}
                  >
                    <TableCell className="text-gray-900">{formatDate(row.fecha)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-700">
                      {truncate(row.folioUuid, 20)}
                    </TableCell>
                    <TableCell className="text-gray-700">{truncate(row.rfcReceptor, 18)}</TableCell>
                    <TableCell className="max-w-[200px] text-gray-700">
                      {truncate(row.concepto, 35)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
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
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-100 hover:bg-gray-100">
                <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                <TableHead className="font-semibold text-gray-700">Folio / UUID</TableHead>
                <TableHead className="font-semibold text-gray-700">RFC emisor</TableHead>
                <TableHead className="font-semibold text-gray-700">Concepto principal</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Monto total</TableHead>
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
                    key={`egr-${idx}-${row.folioUuid}`}
                    className={cn(
                      "border-gray-200",
                      idx % 2 === 1 && "bg-gray-50/80"
                    )}
                  >
                    <TableCell className="text-gray-900">{formatDate(row.fecha)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-700">
                      {truncate(row.folioUuid, 20)}
                    </TableCell>
                    <TableCell className="text-gray-700">{truncate(row.rfcEmisor, 18)}</TableCell>
                    <TableCell className="max-w-[200px] text-gray-700">
                      {truncate(row.concepto, 35)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
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
            <p suppressHydrationWarning>
              Fecha de generación:{" "}
              {new Date().toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
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
