import type { Workbook } from "exceljs";
import type { Invoice } from "@/lib/types/invoices";
import { tableHeaderStyle, dataRowStyle, reportTitleStyle, metaRowStyle, NUM_FMT_ACCOUNTING } from "./styles";
import { formatDateTime } from "../../utils/formatters";

const SHEET_NAME = "Retenciones";

const COLUMNS = [
  "Fecha",
  "UUID relacionado",
  "Tipo retención",
  "Base",
  "IVA retenido",
  "ISR retenido",
  "Total retenido",
] as const;

function toNum(v: number | undefined): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

/** Filtrar facturas que tengan al menos una retención (IVA o ISR). */
function invoicesConRetenciones(invoices: Invoice[]): Invoice[] {
  return invoices.filter(
    (inv) =>
      inv.tipo !== "COMPLEMENTO_PAGO" &&
      (toNum(inv.retencion_iva_amount) > 0 || toNum(inv.retencion_isr_amount) > 0)
  );
}

function getTipoRetencion(inv: Invoice): string {
  const iva = toNum(inv.retencion_iva_amount);
  const isr = toNum(inv.retencion_isr_amount);
  if (iva > 0 && isr > 0) return "IVA e ISR";
  if (iva > 0) return "IVA";
  if (isr > 0) return "ISR";
  return "";
}

/**
 * Construye la hoja "Retenciones" con una fila por cada factura que tenga retenciones.
 * Encabezados en fila 5, datos desde 6. AutoFilter y formato contable.
 */
export function buildRetencionesSheet(workbook: Workbook, invoices: Invoice[], context: { periodo: string; rfc: string }): void {
  const sheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 5, activeCell: "A6", showRowColHeaders: true, showGridLines: true }],
  });

  const list = invoicesConRetenciones(invoices);

  sheet.getRow(1).getCell(1).value = "Retenciones";
  sheet.getRow(1).getCell(1).style = reportTitleStyle;
  sheet.getRow(2).getCell(1).value = context.periodo;
  sheet.getRow(2).getCell(1).style = metaRowStyle;
  sheet.getRow(3).getCell(1).value = context.rfc ? `RFC: ${context.rfc}` : "";
  sheet.getRow(3).getCell(1).style = metaRowStyle;

  const headerRow = sheet.getRow(5);
  COLUMNS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.style = { ...tableHeaderStyle };
  });

  const amountCols = [4, 5, 6, 7];
  list.forEach((inv, idx) => {
    const rowIndex = 6 + idx;
    const row = sheet.getRow(rowIndex);
    const base = typeof inv.subtotal === "number" ? inv.subtotal : Number(inv.subtotal) || 0;
    const ivaRet = toNum(inv.retencion_iva_amount);
    const isrRet = toNum(inv.retencion_isr_amount);
    const totalRet = ivaRet + isrRet;

    row.getCell(1).value = formatDateTime(inv.fecha);
    row.getCell(2).value = inv.uuid ?? "";
    row.getCell(3).value = getTipoRetencion(inv);
    row.getCell(4).value = base;
    row.getCell(5).value = ivaRet;
    row.getCell(6).value = isrRet;
    row.getCell(7).value = totalRet;

    row.eachCell((cell) => {
      cell.style = { ...dataRowStyle };
    });
    amountCols.forEach((col) => {
      row.getCell(col).numFmt = NUM_FMT_ACCOUNTING;
    });
  });

  if (list.length > 0) {
    sheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: 5, column: COLUMNS.length },
    };
  }

  const widths = [18, 38, 14, 14, 14, 14, 14];
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });
}
