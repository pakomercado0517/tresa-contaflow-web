import type { Workbook } from "exceljs";
import type { ExpensesReportContext, ExpensesSheetBuildResult } from "./types";
import { tableHeaderStyle, dataRowStyle, reportTitleStyle, metaRowStyle, NUM_FMT_ACCOUNTING } from "../invoices-report/styles";

const SHEET_NAME = "Resumen Ejecutivo";

export function buildResumenSheet(
  workbook: Workbook,
  payload: { context: ExpensesReportContext; range: ExpensesSheetBuildResult }
): void {
  const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 1, activeCell: "A2", showRowColHeaders: true, showGridLines: true }],
  });

  const context = payload.context;
  const start = payload.range.dataStartRow;
  const end = Math.max(payload.range.dataStartRow, payload.range.dataEndRow);

  worksheet.getRow(1).getCell(1).value = "Resumen Ejecutivo";
  worksheet.getRow(1).getCell(1).style = reportTitleStyle;
  worksheet.getRow(2).getCell(1).value = context.periodo;
  worksheet.getRow(2).getCell(1).style = metaRowStyle;
  worksheet.getRow(3).getCell(1).value = context.rfc
    ? `RFC Contribuyente: ${context.rfc}`
    : "RFC Contribuyente:";
  worksheet.getRow(3).getCell(1).style = metaRowStyle;

  const headerRow = worksheet.getRow(5);
  headerRow.getCell(1).value = "Concepto";
  headerRow.getCell(2).value = "Monto";
  headerRow.getCell(1).style = { ...tableHeaderStyle };
  headerRow.getCell(2).style = { ...tableHeaderStyle };

  const rows: Array<{ label: string; formula: string }> = [
    { label: "Total bruto", formula: `SUM(Gastos!I${start}:I${end})` },
    { label: "Total IVA trasladado", formula: `SUM(Gastos!H${start}:H${end})` },
    { label: "Total retenciones", formula: `SUM(Gastos!L${start}:L${end})` },
    { label: "Total neto después de retenciones", formula: `SUM(Gastos!M${start}:M${end})` },
    { label: "Total pagado real", formula: `SUM(Gastos!O${start}:O${end})` },
    { label: "Total pendiente real", formula: `SUM(Gastos!P${start}:P${end})` },
    { label: "Flujo neto del periodo", formula: "B10-B8" },
  ];

  rows.forEach((item, idx) => {
    const row = worksheet.getRow(6 + idx);
    row.getCell(1).value = item.label;
    row.getCell(1).style = { ...dataRowStyle };
    row.getCell(2).value = { formula: item.formula };
    row.getCell(2).numFmt = NUM_FMT_ACCOUNTING;
    row.getCell(2).style = { ...dataRowStyle, alignment: { ...dataRowStyle.alignment, horizontal: "right" } };
  });

  worksheet.getColumn(1).width = 32;
  worksheet.getColumn(2).width = 20;
}
