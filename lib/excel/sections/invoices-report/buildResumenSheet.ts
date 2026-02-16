import type { Workbook } from "exceljs";
import type { InvoicesReportContext, InvoicesSheetBuildResult } from "./types";
import { tableHeaderStyle, dataRowStyle, reportTitleStyle, metaRowStyle, NUM_FMT_ACCOUNTING } from "./styles";

const SHEET_NAME = "Resumen Ejecutivo";

/**
 * Construye la hoja "Resumen Ejecutivo" con fórmulas reales referenciando "Facturas".
 */
export function buildResumenSheet(
  workbook: Workbook,
  payload: { context: InvoicesReportContext; range: InvoicesSheetBuildResult }
): void {
  const sheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 1, activeCell: "A2", showRowColHeaders: true, showGridLines: true }],
  });

  const context = payload.context;
  const start = payload.range.dataStartRow;
  const end = Math.max(payload.range.dataStartRow, payload.range.dataEndRow);

  sheet.getRow(1).getCell(1).value = "Resumen Ejecutivo";
  sheet.getRow(1).getCell(1).style = reportTitleStyle;
  sheet.getRow(2).getCell(1).value = context.periodo;
  sheet.getRow(2).getCell(1).style = metaRowStyle;
  sheet.getRow(3).getCell(1).value = context.rfc ? `RFC Contribuyente: ${context.rfc}` : "RFC Contribuyente:";
  sheet.getRow(3).getCell(1).style = metaRowStyle;

  const headerRow = sheet.getRow(5);
  headerRow.getCell(1).value = "Concepto";
  headerRow.getCell(2).value = "Monto";
  headerRow.getCell(1).style = { ...tableHeaderStyle };
  headerRow.getCell(2).style = { ...tableHeaderStyle };

  const rows: Array<{ label: string; formula: string }> = [
    { label: "Total bruto", formula: `SUM(Facturas!I${start}:I${end})` },
    { label: "Total IVA trasladado", formula: `SUM(Facturas!H${start}:H${end})` },
    { label: "Total retenciones", formula: `SUM(Facturas!L${start}:L${end})` },
    { label: "Total neto después de retenciones", formula: `SUM(Facturas!M${start}:M${end})` },
    { label: "Total cobrado real", formula: `SUM(Facturas!O${start}:O${end})` },
    { label: "Total pendiente real", formula: `SUM(Facturas!P${start}:P${end})` },
    { label: "Flujo neto del periodo", formula: "B10-B8" },
  ];

  rows.forEach((item, idx) => {
    const dataRow = sheet.getRow(6 + idx);
    dataRow.getCell(1).value = item.label;
    dataRow.getCell(1).style = { ...dataRowStyle };
    dataRow.getCell(2).value = { formula: item.formula };
    dataRow.getCell(2).numFmt = NUM_FMT_ACCOUNTING;
    dataRow.getCell(2).style = { ...dataRowStyle, alignment: { ...dataRowStyle.alignment, horizontal: "right" } };
  });

  sheet.getColumn(1).width = 32;
  sheet.getColumn(2).width = 20;
}
