import type { Worksheet } from "exceljs";
import type { Invoice } from "@/lib/types/invoices";
import type { InvoiceSectionType } from "../core/types";
import {
  corporateTableHeaderStyle,
  corporateDataRowStyle,
  totalCfdiCellStyle,
  estadoVigenteStyle,
  estadoCanceladoStyle,
  totalStyle,
  NUM_FMT_ACCOUNTING,
} from "../core/styles";
import { COLUMN_WIDTHS, ROW_HEIGHT_DATA, CORPORATE } from "../constants";
import { formatDateTime } from "../utils/formatters";

function getPaidAmount(invoice: Invoice): number {
  if (invoice.tipo === "PUE") return invoice.total;
  if (!invoice.pagos?.length) return 0;
  return invoice.pagos.reduce((sum, p) => sum + p.monto, 0);
}

function getPendingAmount(invoice: Invoice): number {
  if (invoice.tipo !== "PUE" && invoice.tipo !== "PPD") return 0;
  const pendiente = invoice.total - getPaidAmount(invoice);
  return pendiente > 0 ? pendiente : 0;
}

function isInvoicePending(invoice: Invoice): boolean {
  if (invoice.tipo !== "PPD") return false;
  return getPaidAmount(invoice) < invoice.total;
}

function isInvoicePaid(invoice: Invoice): boolean {
  if (invoice.tipo === "PUE") return true;
  if (invoice.tipo !== "PPD") return false;
  return getPaidAmount(invoice) >= invoice.total && invoice.total > 0;
}

function isComplementoOrphan(invoice: Invoice, invoices: Invoice[]): boolean {
  if (invoice.tipo !== "COMPLEMENTO_PAGO") return false;
  const uuids =
    invoice.complemento_pago?.facturasRelacionadas?.map((r) => r.uuid) ?? [];
  if (uuids.length === 0) return true;
  return !invoices.some((inv) => uuids.includes(inv.uuid));
}

function filterInvoices(
  invoices: Invoice[],
  sectionType: InvoiceSectionType
): Invoice[] {
  if (sectionType === "pendientes") {
    return invoices.filter((inv) => isInvoicePending(inv));
  }
  if (sectionType === "pagadas") {
    return invoices.filter((inv) => isInvoicePaid(inv));
  }
  return invoices.filter(
    (inv) =>
      inv.tipo !== "COMPLEMENTO_PAGO" || isComplementoOrphan(inv, invoices)
  );
}

/** Estado SAT: VIGENTE si validación ok, CANCELADO si tiene errores o no válido */
function getEstadoSat(invoice: Invoice): "VIGENTE" | "CANCELADO" {
  if (invoice.validacion?.valido === true && !(invoice.validacion?.errores?.length)) {
    return "VIGENTE";
  }
  return "CANCELADO";
}

/** Columnas estilo corporativo (como referencia de imagen) */
const CORPORATE_HEADERS = [
  "Fecha emisión",
  "RFC emisor",
  "Concepto",
  "UUID",
  "Subtotal",
  "IVA (16%)",
  "Total CFDI",
  "Método",
  "Estado SAT",
  "Cuenta contable",
  "Pagado",
  "Pendiente",
] as const;


/**
 * Añade una sección de facturas con diseño corporativo: encabezado teal,
 * columnas detalladas (fecha, RFC, concepto, UUID, subtotal, IVA, total CFDI,
 * método, estado SAT, cuenta contable, pagado, pendiente) y estilos tipo imagen.
 */
export function addInvoicesSection(
  worksheet: Worksheet,
  invoices: Invoice[],
  sectionType: InvoiceSectionType,
  startRow: number
): number {
  const filtered = filterInvoices(invoices, sectionType);

  const headerRow = worksheet.getRow(startRow);
  headerRow.height = ROW_HEIGHT_DATA + 4;
  CORPORATE_HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.style = { ...corporateTableHeaderStyle };
  });

  let currentRow = startRow + 1;
  filtered.forEach((inv, idx) => {
    const row = worksheet.getRow(currentRow);
    row.height = 28;
    const alternate = idx % 2 === 1;
    const baseStyle = corporateDataRowStyle(alternate);
    const paid = getPaidAmount(inv);
    const pending = getPendingAmount(inv);
    const estado = getEstadoSat(inv);
    const subtotal = typeof inv.subtotal === "number" ? inv.subtotal : Number(inv.subtotal) || 0;
    const iva = typeof inv.iva_amount === "number" ? inv.iva_amount : (typeof inv.iva === "number" ? inv.iva : Number(inv.iva) || 0);

    row.getCell(1).value = formatDateTime(inv.fecha);
    row.getCell(1).style = baseStyle;

    row.getCell(2).value = inv.rfc_emisor ?? "—";
    row.getCell(2).style = baseStyle;

    row.getCell(3).value = (inv.concepto ?? "—").toString().substring(0, 200);
    row.getCell(3).style = { ...baseStyle, alignment: { ...baseStyle.alignment, wrapText: true } };

    row.getCell(4).value = inv.uuid ?? "—";
    row.getCell(4).style = baseStyle;

    row.getCell(5).value = subtotal;
    row.getCell(5).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(5).style = baseStyle;

    row.getCell(6).value = iva;
    row.getCell(6).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(6).style = baseStyle;

    row.getCell(7).value = inv.total;
    row.getCell(7).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(7).style = totalCfdiCellStyle;

    row.getCell(8).value = inv.tipo ?? "—";
    row.getCell(8).style = baseStyle;

    row.getCell(9).value = estado;
    row.getCell(9).style = estado === "VIGENTE" ? estadoVigenteStyle : estadoCanceladoStyle;

    row.getCell(10).value = "—";
    row.getCell(10).style = baseStyle;

    row.getCell(11).value = inv.tipo !== "COMPLEMENTO_PAGO" ? paid : "";
    row.getCell(11).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(11).style = baseStyle;

    row.getCell(12).value = inv.tipo !== "COMPLEMENTO_PAGO" ? pending : "";
    row.getCell(12).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(12).style = baseStyle;

    currentRow += 1;
  });

  if (filtered.length > 0) {
    const totalRow = worksheet.getRow(currentRow);
    const total = filtered.reduce((s, i) => s + i.total, 0);
    totalRow.height = ROW_HEIGHT_DATA;
    totalRow.getCell(1).value = "TOTAL";
    totalRow.getCell(1).style = totalStyle(CORPORATE.headerTeal);
    for (let c = 2; c <= 6; c++) {
      totalRow.getCell(c).style = totalStyle(CORPORATE.headerTeal);
    }
    totalRow.getCell(7).value = total;
    totalRow.getCell(7).numFmt = NUM_FMT_ACCOUNTING;
    totalRow.getCell(7).style = { ...totalCfdiCellStyle, font: { bold: true, size: 11, color: { argb: "FFFFFFFF" } } };
    for (let c = 8; c <= 12; c++) {
      totalRow.getCell(c).style = totalStyle(CORPORATE.headerTeal);
    }
    currentRow += 1;
  }

  setInvoicesColumnWidths(worksheet);
  return currentRow + 1;
}

/** Ajusta anchos de columna para la tabla corporativa de facturas */
export function setInvoicesColumnWidths(worksheet: Worksheet): void {
  const widths = [
    COLUMN_WIDTHS.fechaEmision,
    COLUMN_WIDTHS.rfc,
    COLUMN_WIDTHS.concepto,
    COLUMN_WIDTHS.uuid,
    COLUMN_WIDTHS.subtotal,
    COLUMN_WIDTHS.iva,
    COLUMN_WIDTHS.total,
    COLUMN_WIDTHS.metodo,
    COLUMN_WIDTHS.estadoSat,
    COLUMN_WIDTHS.cuentaContable,
    COLUMN_WIDTHS.total,
    COLUMN_WIDTHS.total,
  ];
  widths.forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w;
  });
}
