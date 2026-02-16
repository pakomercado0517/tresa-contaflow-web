import type { Workbook } from "exceljs";
import type { Invoice } from "@/lib/types/invoices";
import type { HeaderMetadata, InvoicesReportContext, InvoicesSheetBuildResult } from "./types";
import {
  tableHeaderStyle,
  dataRowStyle,
  reportTitleStyle,
  metaRowStyle,
  dividerBottomBorder,
  totalsSectionTopBorder,
  NUM_FMT_ACCOUNTING,
  autoFitColumns,
} from "./styles";
import { formatDateTime } from "../../utils/formatters";

const SHEET_NAME = "Facturas";
const HEADER_ROW_INDEX = 6;
const DATA_START_ROW_INDEX = HEADER_ROW_INDEX + 1;

const COLUMNS = [
  "Fecha emisión",
  "UUID",
  "RFC Cliente",
  "Nombre Cliente",
  "Concepto",
  "Régimen",
  "Subtotal",
  "IVA trasladado",
  "Total",
  "IVA retenido",
  "ISR retenido",
  "Total retenido",
  "Total neto facturado",
  "Estado de pago",
  "Total pagado acumulado",
  "Monto pendiente",
  "¿Tiene complemento?",
  "Número de parcialidad",
  "Fecha último pago",
  "UUID complemento",
] as const;

function getPaidAmount(inv: Invoice): number {
  if (inv.tipo === "PUE") return inv.total;
  if (!inv.pagos?.length) return 0;
  return inv.pagos.reduce((s, p) => s + p.monto, 0);
}

function getEstadoPago(inv: Invoice): "Pagada" | "Pendiente" | "" {
  if (inv.tipo === "COMPLEMENTO_PAGO") return "";
  if (inv.tipo === "PUE") return "Pagada";
  return getPaidAmount(inv) >= inv.total && inv.total > 0 ? "Pagada" : "Pendiente";
}

function getRetIva(inv: Invoice): number {
  return typeof inv.retencion_iva_amount === "number" ? inv.retencion_iva_amount : 0;
}

function getRetIsr(inv: Invoice): number {
  return typeof inv.retencion_isr_amount === "number" ? inv.retencion_isr_amount : 0;
}

function getTotalRetenido(inv: Invoice): number {
  return getRetIva(inv) + getRetIsr(inv);
}

function getTotalNetoFacturado(inv: Invoice): number {
  if (inv.tipo === "COMPLEMENTO_PAGO") return 0;
  return inv.total - getTotalRetenido(inv);
}

function getTieneComplemento(inv: Invoice): string {
  if (inv.tipo === "COMPLEMENTO_PAGO") return "Sí";
  const hasComplement = Boolean(inv.estadoPago?.tieneComplementos) || (inv.pagos?.length ?? 0) > 0;
  return hasComplement ? "Sí" : "No";
}

function getNumeroParcialidad(inv: Invoice): number | null {
  if (inv.tipo === "COMPLEMENTO_PAGO") {
    return inv.complemento_pago?.facturasRelacionadas?.[0]?.numParcialidad ?? null;
  }
  if (inv.tipo === "PPD") {
    const pagosCount = inv.pagos?.length ?? 0;
    return pagosCount > 0 ? pagosCount : null;
  }
  return null;
}

function getTotalPagadoAcumulado(inv: Invoice): number {
  if (inv.tipo === "COMPLEMENTO_PAGO") {
    return inv.complemento_pago?.monto ?? 0;
  }
  return getPaidAmount(inv);
}

function getFechaUltimoPago(inv: Invoice): string {
  if (inv.tipo === "COMPLEMENTO_PAGO" && inv.complemento_pago?.fechaPago) {
    return formatDateTime(inv.complemento_pago.fechaPago);
  }
  const pagos = inv.pagos ?? [];
  if (pagos.length === 0) return "";
  const latest = [...pagos].sort(
    (a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()
  )[0];
  return latest?.fechaPago ? formatDateTime(latest.fechaPago) : "";
}

function getUuidComplemento(inv: Invoice): string {
  if (inv.tipo === "COMPLEMENTO_PAGO") return inv.uuid ?? "";
  return "";
}

export function buildHeaderSection(
  worksheet: ReturnType<Workbook["addWorksheet"]>,
  metadata: HeaderMetadata
): void {
  const r1 = worksheet.getRow(1);
  r1.getCell(1).value = metadata.title;
  r1.getCell(1).style = reportTitleStyle;

  const r2 = worksheet.getRow(2);
  r2.getCell(1).value = metadata.period;
  r2.getCell(1).style = metaRowStyle;

  const r3 = worksheet.getRow(3);
  r3.getCell(1).value = metadata.rfc ? `RFC Contribuyente: ${metadata.rfc}` : "RFC Contribuyente:";
  r3.getCell(1).style = metaRowStyle;

  const r4 = worksheet.getRow(4);
  r4.getCell(1).value = "";
  r4.getCell(1).style = dividerBottomBorder;
  for (let col = 2; col <= COLUMNS.length; col += 1) {
    r4.getCell(col).style = dividerBottomBorder;
  }
}

/**
 * Construye la tabla principal de facturas y retorna el rango de filas de datos.
 */
export function buildInvoicesTable(
  worksheet: ReturnType<Workbook["addWorksheet"]>,
  invoices: Invoice[]
): InvoicesSheetBuildResult {
  const headerRow = worksheet.getRow(HEADER_ROW_INDEX);
  COLUMNS.forEach((header, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = header;
    cell.style = { ...tableHeaderStyle };
  });

  const amountCols = [7, 8, 9, 10, 11, 12, 13, 15, 16];
  invoices.forEach((inv, idx) => {
    const rowIndex = DATA_START_ROW_INDEX + idx;
    const row = worksheet.getRow(rowIndex);
    const subtotal = typeof inv.subtotal === "number" ? inv.subtotal : Number(inv.subtotal) || 0;
    const ivaTrasladado =
      typeof inv.iva_amount === "number"
        ? inv.iva_amount
        : typeof inv.iva === "number"
          ? inv.iva
          : Number(inv.iva) || 0;
    const paidAmount = getTotalPagadoAcumulado(inv);
    const ivaRetenido = getRetIva(inv);
    const isrRetenido = getRetIsr(inv);
    const totalRetenido = getTotalRetenido(inv);
    const totalNeto = getTotalNetoFacturado(inv);
    const rowFormula = rowIndex;

    row.getCell(1).value = formatDateTime(inv.fecha);
    row.getCell(2).value = inv.uuid ?? "";
    row.getCell(3).value = inv.rfc_receptor ?? "";
    row.getCell(4).value = inv.nombre_receptor ?? "";
    row.getCell(5).value = (inv.concepto ?? "").toString().slice(0, 500);
    row.getCell(6).value = inv.regimen_fiscal_receptor ?? inv.regimen_fiscal_emisor ?? "";
    row.getCell(7).value = inv.tipo !== "COMPLEMENTO_PAGO" ? subtotal : null;
    row.getCell(8).value = inv.tipo !== "COMPLEMENTO_PAGO" ? ivaTrasladado : null;
    row.getCell(9).value = inv.tipo !== "COMPLEMENTO_PAGO" ? inv.total : null;
    row.getCell(10).value = inv.tipo !== "COMPLEMENTO_PAGO" ? ivaRetenido : null;
    row.getCell(11).value = inv.tipo !== "COMPLEMENTO_PAGO" ? isrRetenido : null;
    row.getCell(12).value = inv.tipo !== "COMPLEMENTO_PAGO" ? totalRetenido : null;
    row.getCell(13).value = inv.tipo !== "COMPLEMENTO_PAGO" ? totalNeto : null;
    row.getCell(14).value = getEstadoPago(inv);
    row.getCell(15).value = inv.tipo !== "COMPLEMENTO_PAGO" ? paidAmount : null;
    row.getCell(16).value =
      inv.tipo !== "COMPLEMENTO_PAGO"
        ? { formula: `IF(I${rowFormula}=\"\",0,I${rowFormula}-O${rowFormula})` }
        : null;
    row.getCell(17).value = getTieneComplemento(inv);
    row.getCell(18).value = getNumeroParcialidad(inv);
    row.getCell(19).value = getFechaUltimoPago(inv);
    row.getCell(20).value = getUuidComplemento(inv);

    row.eachCell((cell) => {
      cell.style = { ...dataRowStyle };
    });
    amountCols.forEach((col) => {
      const cell = row.getCell(col);
      if (cell.value !== null && cell.value !== "") {
        cell.numFmt = NUM_FMT_ACCOUNTING;
        cell.alignment = { ...cell.alignment, horizontal: "right" };
      }
    });
  });

  const dataEndRow =
    invoices.length > 0 ? DATA_START_ROW_INDEX + invoices.length - 1 : DATA_START_ROW_INDEX;

  worksheet.autoFilter = {
    from: { row: HEADER_ROW_INDEX, column: 1 },
    to: { row: HEADER_ROW_INDEX, column: COLUMNS.length },
  };

  return {
    dataStartRow: DATA_START_ROW_INDEX,
    dataEndRow,
  };
}

/**
 * Bloque de totales con fórmulas reales al final de la tabla principal.
 */
export function buildTotalsSection(
  worksheet: ReturnType<Workbook["addWorksheet"]>,
  range: InvoicesSheetBuildResult
): void {
  const formulaStart = range.dataStartRow;
  const formulaEnd = Math.max(range.dataStartRow, range.dataEndRow);
  const totalsTitleRow = formulaEnd + 3;
  const totalsStartRow = totalsTitleRow + 1;

  const titleCell = worksheet.getRow(totalsTitleRow).getCell(1);
  titleCell.value = "Totales del periodo";
  titleCell.style = {
    ...metaRowStyle,
    ...totalsSectionTopBorder,
    font: { name: "Calibri", size: 11, bold: true },
  };
  worksheet.getRow(totalsTitleRow).getCell(2).style = {
    ...metaRowStyle,
    ...totalsSectionTopBorder,
  };

  const totals: Array<{ label: string; formula: string }> = [
    { label: "Total bruto", formula: `SUM(I${formulaStart}:I${formulaEnd})` },
    { label: "Total IVA trasladado", formula: `SUM(H${formulaStart}:H${formulaEnd})` },
    { label: "Total IVA retenido", formula: `SUM(J${formulaStart}:J${formulaEnd})` },
    { label: "Total ISR retenido", formula: `SUM(K${formulaStart}:K${formulaEnd})` },
    { label: "Total retenciones", formula: `SUM(L${formulaStart}:L${formulaEnd})` },
    { label: "Total neto después de retenciones", formula: `SUM(M${formulaStart}:M${formulaEnd})` },
    { label: "Total cobrado real", formula: `SUM(O${formulaStart}:O${formulaEnd})` },
    { label: "Total pendiente real", formula: `SUM(P${formulaStart}:P${formulaEnd})` },
  ];

  totals.forEach((item, idx) => {
    const row = worksheet.getRow(totalsStartRow + idx);
    row.getCell(1).value = item.label;
    row.getCell(1).style = { ...dataRowStyle };
    row.getCell(2).value = { formula: item.formula };
    row.getCell(2).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(2).style = { ...dataRowStyle, alignment: { ...dataRowStyle.alignment, horizontal: "right" } };
  });
}

/**
 * Hoja principal de facturas con encabezado, tabla, totales y estilos reutilizables.
 */
export function buildInvoicesSheet(
  workbook: Workbook,
  invoices: Invoice[],
  context: InvoicesReportContext
): InvoicesSheetBuildResult {
  const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 6, activeCell: "A7", showRowColHeaders: true, showGridLines: true }],
  });

  buildHeaderSection(worksheet, {
    title: context.titulo,
    period: context.periodo,
    rfc: context.rfc,
  });
  const range = buildInvoicesTable(worksheet, invoices);
  buildTotalsSection(worksheet, range);
  autoFitColumns(worksheet, { minWidth: 10, maxWidth: 50 });
  return range;
}
