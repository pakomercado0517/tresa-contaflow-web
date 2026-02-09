import type { Worksheet } from "exceljs";
import type { ExcelMetrics } from "../core/types";
import { totalStyle } from "../core/styles";
import { COLORS } from "../constants";

/**
 * Añade la sección de resumen financiero (métricas).
 * Devuelve la siguiente fila disponible después del resumen.
 */
export function addSummary(
  worksheet: Worksheet,
  metrics: ExcelMetrics,
  startRow: number,
  tipo: "completo" | "facturas" | "gastos"
): number {
  let row = startRow;

  const titleRow = worksheet.getRow(row);
  titleRow.getCell(1).value = "Resumen Financiero";
  titleRow.getCell(1).style = { font: { bold: true, size: 12 } };
  row += 2;

  const metricsToShow: Array<{ label: string; value: number; color: string }> = [];

  if (tipo === "completo") {
    metricsToShow.push(
      { label: "Total Facturado", value: metrics.totalFacturado, color: COLORS.totalFacturado },
      { label: "Total Pagado", value: metrics.totalPagado, color: COLORS.totalPagado },
      { label: "Total Compras", value: metrics.totalCompras, color: COLORS.totalCompras },
      { label: "Pendiente por Pagar", value: metrics.pendientePorPagar, color: COLORS.pendiente },
      {
        label: "Diferencia Ingresos - Gastos",
        value: metrics.diferencia,
        color: metrics.diferencia >= 0 ? COLORS.diferenciaPositiva : COLORS.diferenciaNegativa,
      }
    );
  } else if (tipo === "facturas") {
    metricsToShow.push(
      { label: "Total Facturado", value: metrics.totalFacturado, color: COLORS.totalFacturado },
      { label: "Total Pagado", value: metrics.totalPagado, color: COLORS.totalPagado },
      { label: "Pendiente por Pagar", value: metrics.pendientePorPagar, color: COLORS.pendiente }
    );
  } else {
    metricsToShow.push({
      label: "Total Gastos",
      value: metrics.totalCompras,
      color: COLORS.totalCompras,
    });
  }

  for (const m of metricsToShow) {
    const r = worksheet.getRow(row);
    r.getCell(1).value = m.label;
    r.getCell(1).style = { font: { size: 10 } };
    r.getCell(2).value = m.value;
    r.getCell(2).style = totalStyle(m.color);
    r.getCell(2).numFmt = '"$"#,##0.00';
    row += 1;
  }

  return row + 1;
}
