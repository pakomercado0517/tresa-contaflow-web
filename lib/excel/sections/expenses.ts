import type { Worksheet } from "exceljs";
import type { Expense } from "@/lib/types/expenses";
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

function getEstadoSat(exp: Expense): "VIGENTE" | "CANCELADO" {
  if (exp.validacion?.valido === true && !(exp.validacion?.errores?.length)) {
    return "VIGENTE";
  }
  return "CANCELADO";
}

const CORPORATE_HEADERS = [
  "Fecha emisión",
  "RFC emisor",
  "Concepto",
  "UUID",
  "Subtotal",
  "IVA (16%)",
  "Total",
  "Origen",
  "Estado SAT",
  "Categoría",
] as const;


/**
 * Añade la sección de gastos con diseño corporativo (mismo estilo que facturas):
 * encabezado teal, columnas detalladas, Total en verde, Estado SAT en verde/rojo.
 */
export function addExpensesSection(
  worksheet: Worksheet,
  expenses: Expense[],
  startRow: number
): number {
  const headerRow = worksheet.getRow(startRow);
  headerRow.height = ROW_HEIGHT_DATA + 4;
  CORPORATE_HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.style = { ...corporateTableHeaderStyle };
  });

  let currentRow = startRow + 1;
  expenses.forEach((exp, idx) => {
    const row = worksheet.getRow(currentRow);
    row.height = 26;
    const alternate = idx % 2 === 1;
    const baseStyle = corporateDataRowStyle(alternate);
    const estado = getEstadoSat(exp);
    const subtotal = typeof exp.subtotal === "number" ? exp.subtotal : Number(exp.subtotal) || 0;
    const iva = typeof exp.iva_amount === "number" ? exp.iva_amount : (typeof exp.iva === "number" ? exp.iva : Number(exp.iva) || 0);

    row.getCell(1).value = formatDateTime(exp.fecha);
    row.getCell(1).style = baseStyle;

    row.getCell(2).value = exp.rfc_emisor ?? "—";
    row.getCell(2).style = baseStyle;

    row.getCell(3).value = (exp.concepto ?? "Sin concepto").toString().substring(0, 200);
    row.getCell(3).style = { ...baseStyle, alignment: { ...baseStyle.alignment, wrapText: true } };

    row.getCell(4).value = exp.uuid ?? "—";
    row.getCell(4).style = baseStyle;

    row.getCell(5).value = subtotal;
    row.getCell(5).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(5).style = baseStyle;

    row.getCell(6).value = iva;
    row.getCell(6).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(6).style = baseStyle;

    row.getCell(7).value = exp.total;
    row.getCell(7).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(7).style = totalCfdiCellStyle;

    row.getCell(8).value = exp.tipo_origen === "XML" ? "XML" : "MANUAL";
    row.getCell(8).style = baseStyle;

    row.getCell(9).value = estado;
    row.getCell(9).style = estado === "VIGENTE" ? estadoVigenteStyle : estadoCanceladoStyle;

    row.getCell(10).value = exp.categoria ?? "—";
    row.getCell(10).style = baseStyle;

    currentRow += 1;
  });

  if (expenses.length > 0) {
    const totalRow = worksheet.getRow(currentRow);
    const total = expenses.reduce((s, e) => s + e.total, 0);
    totalRow.height = ROW_HEIGHT_DATA;
    totalRow.getCell(1).value = "TOTAL";
    totalRow.getCell(1).style = totalStyle(CORPORATE.headerTeal);
    for (let c = 2; c <= 6; c++) {
      totalRow.getCell(c).style = totalStyle(CORPORATE.headerTeal);
    }
    totalRow.getCell(7).value = total;
    totalRow.getCell(7).numFmt = NUM_FMT_ACCOUNTING;
    totalRow.getCell(7).style = { ...totalCfdiCellStyle, font: { bold: true, size: 11, color: { argb: "FFFFFFFF" } } };
    for (let c = 8; c <= 10; c++) {
      totalRow.getCell(c).style = totalStyle(CORPORATE.headerTeal);
    }
    currentRow += 1;
  }

  const widths = [
    COLUMN_WIDTHS.fechaEmision,
    COLUMN_WIDTHS.rfc,
    COLUMN_WIDTHS.concepto,
    COLUMN_WIDTHS.uuid,
    COLUMN_WIDTHS.subtotal,
    COLUMN_WIDTHS.iva,
    COLUMN_WIDTHS.total,
    COLUMN_WIDTHS.origen,
    COLUMN_WIDTHS.estadoSat,
    14,
  ];
  widths.forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w;
  });

  return currentRow + 1;
}
