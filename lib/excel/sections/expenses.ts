import type { Worksheet } from "exceljs";
import type { Expense } from "@/lib/types/expenses";
import { tableHeaderStyle, dataStyle, dataAlternateStyle, totalStyle } from "../core/styles";
import { COLORS, COLUMN_WIDTHS, ROW_HEIGHT_DATA } from "../constants";
import { formatDate } from "../utils/formatters";

const HEADERS = ["Origen", "Fecha", "Total", "Concepto", "RFC Proveedor"];

/**
 * Añade la sección de gastos a la hoja.
 * Devuelve la siguiente fila disponible después de la tabla.
 */
export function addExpensesSection(
  worksheet: Worksheet,
  expenses: Expense[],
  startRow: number
): number {
  const colors = COLORS.gastos;

  const headerRow = worksheet.getRow(startRow);
  headerRow.height = ROW_HEIGHT_DATA;
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.style = tableHeaderStyle(colors.header);
  });

  let currentRow = startRow + 1;
  const totalGastos = expenses.reduce((sum, exp) => sum + exp.total, 0);

  expenses.forEach((exp, idx) => {
    const row = worksheet.getRow(currentRow);
    row.height = ROW_HEIGHT_DATA;
    const style = idx % 2 === 1 ? dataAlternateStyle(colors.alternate) : dataStyle;

    row.getCell(1).value = exp.tipo_origen === "XML" ? "XML" : "MANUAL";
    row.getCell(1).style = style;
    row.getCell(2).value = formatDate(exp.fecha);
    row.getCell(2).style = style;
    row.getCell(3).value = exp.total;
    row.getCell(3).numFmt = '"$"#,##0.00';
    row.getCell(3).style = style;
    row.getCell(4).value = (exp.concepto ?? "Sin concepto").substring(0, 100);
    row.getCell(4).style = style;
    row.getCell(5).value = exp.rfc_emisor ?? "N/A";
    row.getCell(5).style = style;
    currentRow += 1;
  });

  const totalRow = worksheet.getRow(currentRow);
  totalRow.getCell(1).value = "TOTAL";
  totalRow.getCell(1).style = totalStyle(colors.header);
  totalRow.getCell(3).value = totalGastos;
  totalRow.getCell(3).numFmt = '"$"#,##0.00';
  totalRow.getCell(3).style = totalStyle(colors.header);
  currentRow += 1;

  const colWidths = [COLUMN_WIDTHS.origen, COLUMN_WIDTHS.fecha, COLUMN_WIDTHS.total, COLUMN_WIDTHS.concepto, COLUMN_WIDTHS.rfc];
  colWidths.forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w;
  });

  return currentRow + 1;
}
