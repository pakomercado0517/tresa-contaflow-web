import type { Workbook } from "exceljs";
import type { Expense } from "@/lib/types/expenses";
import type { ExpensesReportContext, ExpensesSheetBuildResult, HeaderMetadata } from "./types";
import {
  tableHeaderStyle,
  dataRowStyle,
  reportTitleStyle,
  metaRowStyle,
  dividerBottomBorder,
  totalsSectionTopBorder,
  NUM_FMT_ACCOUNTING,
  autoFitColumns,
} from "../invoices-report/styles";
import { formatDateTime } from "../../utils/formatters";

const SHEET_NAME = "Gastos";
const HEADER_ROW_INDEX = 6;
const DATA_START_ROW_INDEX = HEADER_ROW_INDEX + 1;

const COLUMNS = [
  "Fecha emisión",
  "UUID",
  "RFC Proveedor",
  "Nombre Proveedor",
  "Concepto",
  "Categoría",
  "Subtotal",
  "IVA trasladado",
  "Total",
  "IVA retenido",
  "ISR retenido",
  "Total retenido",
  "Total neto gasto",
  "Estado de pago",
  "Total pagado acumulado",
  "Monto pendiente",
  "¿Tiene complemento?",
  "Número de parcialidad",
  "Fecha último pago",
  "UUID complemento",
] as const;

function getPaidAmount(exp: Expense): number {
  if (exp.is_paid === true) return exp.total;
  if (exp.tipo === "PUE") return exp.total;
  if (exp.tipo === "COMPLEMENTO_PAGO") return exp.complemento_pago?.monto ?? 0;
  if (!exp.pagos?.length) return 0;
  return exp.pagos.reduce((sum, pago) => sum + pago.monto, 0);
}

function getEstadoPago(exp: Expense): "Pagada" | "Pendiente" | "" {
  if (exp.tipo === "COMPLEMENTO_PAGO") return "";
  if (exp.is_paid === true) return "Pagada";
  if (exp.tipo === "PUE") return "Pagada";
  if (exp.estadoPago?.estado === "PAGADO" || exp.estadoPago?.completamentePagado) return "Pagada";
  return "Pendiente";
}

function getRetIva(exp: Expense): number {
  return typeof exp.retencion_iva_amount === "number" ? exp.retencion_iva_amount : 0;
}

function getRetIsr(exp: Expense): number {
  return typeof exp.retencion_isr_amount === "number" ? exp.retencion_isr_amount : 0;
}

function getTotalRetenido(exp: Expense): number {
  return getRetIva(exp) + getRetIsr(exp);
}

function getTotalNeto(exp: Expense): number {
  return exp.total - getTotalRetenido(exp);
}

function getTieneComplemento(exp: Expense): string {
  if (exp.tipo === "COMPLEMENTO_PAGO") return "Sí";
  const hasComplement = Boolean(exp.estadoPago?.tieneComplementos) || (exp.pagos?.length ?? 0) > 0;
  return hasComplement ? "Sí" : "No";
}

function getNumeroParcialidad(exp: Expense): number | null {
  if (exp.tipo === "COMPLEMENTO_PAGO") {
    return exp.complemento_pago?.facturasRelacionadas?.[0]?.numParcialidad ?? null;
  }
  const pagosCount = exp.pagos?.length ?? 0;
  return pagosCount > 0 ? pagosCount : null;
}

function getFechaUltimoPago(exp: Expense): string {
  if (exp.payment_date) return formatDateTime(exp.payment_date);
  if (exp.tipo === "COMPLEMENTO_PAGO" && exp.complemento_pago?.fechaPago) {
    return formatDateTime(exp.complemento_pago.fechaPago);
  }
  const pagos = exp.pagos ?? [];
  if (pagos.length === 0) return "";
  const latest = [...pagos].sort(
    (a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()
  )[0];
  return latest?.fechaPago ? formatDateTime(latest.fechaPago) : "";
}

function getUuidComplemento(exp: Expense): string {
  if (exp.tipo === "COMPLEMENTO_PAGO") return exp.uuid ?? "";
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

export function buildExpensesTable(
  worksheet: ReturnType<Workbook["addWorksheet"]>,
  expenses: Expense[]
): ExpensesSheetBuildResult {
  const headerRow = worksheet.getRow(HEADER_ROW_INDEX);
  COLUMNS.forEach((header, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = header;
    cell.style = { ...tableHeaderStyle };
  });

  const amountCols = [7, 8, 9, 10, 11, 12, 13, 15, 16];
  expenses.forEach((exp, idx) => {
    const rowIndex = DATA_START_ROW_INDEX + idx;
    const row = worksheet.getRow(rowIndex);
    const subtotal = typeof exp.subtotal === "number" ? exp.subtotal : Number(exp.subtotal) || 0;
    const ivaTrasladado =
      typeof exp.iva_amount === "number"
        ? exp.iva_amount
        : typeof exp.iva === "number"
          ? exp.iva
          : Number(exp.iva) || 0;
    const totalPagado = getPaidAmount(exp);
    const ivaRetenido = getRetIva(exp);
    const isrRetenido = getRetIsr(exp);
    const totalRetenido = getTotalRetenido(exp);
    const totalNeto = getTotalNeto(exp);

    row.getCell(1).value = formatDateTime(exp.fecha);
    row.getCell(2).value = exp.uuid ?? "";
    row.getCell(3).value = exp.rfc_emisor ?? "";
    row.getCell(4).value = exp.nombre_emisor ?? "";
    row.getCell(5).value = (exp.concepto ?? "").toString().slice(0, 500);
    row.getCell(6).value = exp.categoria ?? "";
    row.getCell(7).value = exp.tipo !== "COMPLEMENTO_PAGO" ? subtotal : null;
    row.getCell(8).value = exp.tipo !== "COMPLEMENTO_PAGO" ? ivaTrasladado : null;
    row.getCell(9).value = exp.tipo !== "COMPLEMENTO_PAGO" ? exp.total : null;
    row.getCell(10).value = exp.tipo !== "COMPLEMENTO_PAGO" ? ivaRetenido : null;
    row.getCell(11).value = exp.tipo !== "COMPLEMENTO_PAGO" ? isrRetenido : null;
    row.getCell(12).value = exp.tipo !== "COMPLEMENTO_PAGO" ? totalRetenido : null;
    row.getCell(13).value = exp.tipo !== "COMPLEMENTO_PAGO" ? totalNeto : null;
    row.getCell(14).value = getEstadoPago(exp);
    row.getCell(15).value = exp.tipo !== "COMPLEMENTO_PAGO" ? totalPagado : null;
    row.getCell(16).value =
      exp.tipo !== "COMPLEMENTO_PAGO"
        ? { formula: `IF(I${rowIndex}="",0,I${rowIndex}-O${rowIndex})` }
        : null;
    row.getCell(17).value = getTieneComplemento(exp);
    row.getCell(18).value = getNumeroParcialidad(exp);
    row.getCell(19).value = getFechaUltimoPago(exp);
    row.getCell(20).value = getUuidComplemento(exp);

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
    expenses.length > 0 ? DATA_START_ROW_INDEX + expenses.length - 1 : DATA_START_ROW_INDEX;

  worksheet.autoFilter = {
    from: { row: HEADER_ROW_INDEX, column: 1 },
    to: { row: HEADER_ROW_INDEX, column: COLUMNS.length },
  };

  return {
    dataStartRow: DATA_START_ROW_INDEX,
    dataEndRow,
  };
}

export function buildTotalsSection(
  worksheet: ReturnType<Workbook["addWorksheet"]>,
  range: ExpensesSheetBuildResult
): void {
  const start = range.dataStartRow;
  const end = Math.max(range.dataStartRow, range.dataEndRow);
  const totalsTitleRow = end + 3;
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
    { label: "Total bruto", formula: `SUM(I${start}:I${end})` },
    { label: "Total IVA trasladado", formula: `SUM(H${start}:H${end})` },
    { label: "Total IVA retenido", formula: `SUM(J${start}:J${end})` },
    { label: "Total ISR retenido", formula: `SUM(K${start}:K${end})` },
    { label: "Total retenciones", formula: `SUM(L${start}:L${end})` },
    { label: "Total neto después de retenciones", formula: `SUM(M${start}:M${end})` },
    { label: "Total pagado real", formula: `SUM(O${start}:O${end})` },
    { label: "Total pendiente real", formula: `SUM(P${start}:P${end})` },
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

export function buildExpensesSheet(
  workbook: Workbook,
  expenses: Expense[],
  context: ExpensesReportContext
): ExpensesSheetBuildResult {
  const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 6, activeCell: "A7", showRowColHeaders: true, showGridLines: true }],
  });

  buildHeaderSection(worksheet, {
    title: context.titulo,
    period: context.periodo,
    rfc: context.rfc,
  });
  const range = buildExpensesTable(worksheet, expenses);
  buildTotalsSection(worksheet, range);
  autoFitColumns(worksheet, { minWidth: 10, maxWidth: 50 });
  return range;
}
