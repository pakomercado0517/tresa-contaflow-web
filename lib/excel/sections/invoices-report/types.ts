import type { Invoice } from "@/lib/types/invoices";

/** Contexto del reporte de facturas (periodo, RFC, nombre perfil) */
export interface InvoicesReportContext {
  titulo: string;
  periodo: string;
  rfc: string;
}

/** Datos de entrada para construir el workbook de facturas */
export interface InvoicesReportData {
  invoices: Invoice[];
  context: InvoicesReportContext;
}

/** Metadatos base para encabezado de hoja */
export interface HeaderMetadata {
  title: string;
  period: string;
  rfc: string;
}

/** Resultado de construcción de la hoja Facturas */
export interface InvoicesSheetBuildResult {
  dataStartRow: number;
  dataEndRow: number;
}
