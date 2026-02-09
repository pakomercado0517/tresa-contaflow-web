import type { Worksheet } from "exceljs";
import type { Invoice } from "@/lib/types/invoices";
import type { InvoiceSectionType } from "../core/types";
import { tableHeaderStyle, dataStyle, dataAlternateStyle, totalStyle } from "../core/styles";
import { COLORS, COLUMN_WIDTHS, ROW_HEIGHT_DATA } from "../constants";
import { formatDate } from "../utils/formatters";

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

function getSectionColors(sectionType: InvoiceSectionType) {
  if (sectionType === "pendientes") return COLORS.facturasPendientes;
  if (sectionType === "pagadas") return COLORS.facturasPagadas;
  return COLORS.todasFacturas;
}

const HEADERS_PENDIENTES = [
  "UUID",
  "Fecha",
  "Total",
  "Pagado",
  "Pendiente",
  "RFC Emisor",
];
const HEADERS_PAGADAS = [
  "UUID",
  "Fecha",
  "Tipo",
  "Total",
  "Pagado",
  "RFC Emisor",
];
const HEADERS_TODAS = [
  "UUID",
  "Fecha",
  "Tipo",
  "Total",
  "Pagado",
  "Pendiente",
  "RFC Emisor",
  "RFC Receptor",
];

function getHeaders(sectionType: InvoiceSectionType): string[] {
  if (sectionType === "pendientes") return HEADERS_PENDIENTES;
  if (sectionType === "pagadas") return HEADERS_PAGADAS;
  return HEADERS_TODAS;
}

/**
 * Añade una sección de facturas a la hoja (pendientes, pagadas o todas).
 * Devuelve la siguiente fila disponible después de la tabla.
 */
export function addInvoicesSection(
  worksheet: Worksheet,
  invoices: Invoice[],
  sectionType: InvoiceSectionType,
  startRow: number
): number {
  const filtered = filterInvoices(invoices, sectionType);
  const colors = getSectionColors(sectionType);
  const headers = getHeaders(sectionType);

  const headerRow = worksheet.getRow(startRow);
  headerRow.height = ROW_HEIGHT_DATA;
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.style = tableHeaderStyle(colors.header);
  });

  let currentRow = startRow + 1;
  filtered.forEach((inv, idx) => {
    const row = worksheet.getRow(currentRow);
    row.height = ROW_HEIGHT_DATA;
    const paid = getPaidAmount(inv);
    const pending = getPendingAmount(inv);
    const style = idx % 2 === 1 ? dataAlternateStyle(colors.alternate) : dataStyle;

    if (sectionType === "pendientes") {
      row.getCell(1).value = inv.uuid ? inv.uuid.substring(0, 8) + "..." : "N/A";
      row.getCell(2).value = formatDate(inv.fecha);
      row.getCell(3).value = inv.total;
      row.getCell(3).numFmt = '"$"#,##0.00';
      row.getCell(4).value = paid;
      row.getCell(4).numFmt = '"$"#,##0.00';
      row.getCell(5).value = pending;
      row.getCell(5).numFmt = '"$"#,##0.00';
      row.getCell(6).value = inv.rfc_emisor ?? "N/A";
      [1, 2, 3, 4, 5, 6].forEach((c) => {
        row.getCell(c).style = style;
      });
    } else if (sectionType === "pagadas") {
      row.getCell(1).value = inv.uuid ? inv.uuid.substring(0, 8) + "..." : "N/A";
      row.getCell(2).value = formatDate(inv.fecha);
      row.getCell(3).value = inv.tipo ?? "N/A";
      row.getCell(4).value = inv.total;
      row.getCell(4).numFmt = '"$"#,##0.00';
      row.getCell(5).value = paid;
      row.getCell(5).numFmt = '"$"#,##0.00';
      row.getCell(6).value = inv.rfc_emisor ?? "N/A";
      [1, 2, 3, 4, 5, 6].forEach((c) => {
        row.getCell(c).style = style;
      });
    } else {
      row.getCell(1).value = inv.uuid ? inv.uuid.substring(0, 8) + "..." : "N/A";
      row.getCell(2).value = formatDate(inv.fecha);
      row.getCell(3).value = inv.tipo ?? "N/A";
      row.getCell(4).value = inv.total;
      row.getCell(4).numFmt = '"$"#,##0.00';
      row.getCell(5).value = inv.tipo !== "COMPLEMENTO_PAGO" ? paid : "";
      row.getCell(5).numFmt = '"$"#,##0.00';
      row.getCell(6).value = inv.tipo !== "COMPLEMENTO_PAGO" ? pending : "";
      row.getCell(6).numFmt = '"$"#,##0.00';
      row.getCell(7).value = inv.rfc_emisor ?? "N/A";
      row.getCell(8).value = inv.rfc_receptor ?? "N/A";
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((c) => {
        row.getCell(c).style = style;
      });
    }
    currentRow += 1;
  });

  if (filtered.length > 0 && sectionType === "todas") {
    const totalRow = worksheet.getRow(currentRow);
    const total = filtered.reduce((s, i) => s + i.total, 0);
    totalRow.getCell(1).value = "TOTAL";
    totalRow.getCell(1).style = totalStyle(colors.header);
    totalRow.getCell(4).value = total;
    totalRow.getCell(4).numFmt = '"$"#,##0.00';
    totalRow.getCell(4).style = totalStyle(colors.header);
    currentRow += 1;
  }

  return currentRow + 1;
}

export function setInvoicesColumnWidths(worksheet: Worksheet, sectionType: InvoiceSectionType): void {
  const headers = getHeaders(sectionType);
  headers.forEach((_, i) => {
    const col = worksheet.getColumn(i + 1);
    if (sectionType === "todas" && i >= 6) {
      col.width = COLUMN_WIDTHS.rfc;
    } else {
      col.width = [COLUMN_WIDTHS.uuid, COLUMN_WIDTHS.fecha, COLUMN_WIDTHS.tipo, COLUMN_WIDTHS.total, COLUMN_WIDTHS.total, COLUMN_WIDTHS.total, COLUMN_WIDTHS.rfc, COLUMN_WIDTHS.rfc][i] ?? 12;
    }
  });
}
