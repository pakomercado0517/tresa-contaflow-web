import type { Worksheet } from "exceljs";
import type { ExcelMetrics } from "../core/types";
import { totalStyle, resumenFinancieroValueStyle, NUM_FMT_ACCOUNTING } from "../core/styles";
import { COLORS } from "../constants";

/**
 * Añade la sección de resumen financiero (métricas).
 * Para facturas y gastos usa cajas con color y borde negro fino como en la referencia.
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

  worksheet.getColumn(1).width = 28;
  worksheet.getColumn(2).width = 22;

  const useResumenStyle = tipo === "facturas" || tipo === "gastos";

  for (const m of metricsToShow) {
    const r = worksheet.getRow(row);
    r.height = 22;
    r.getCell(1).value = m.label;
    r.getCell(1).style = { font: { size: 11 } };
    r.getCell(2).value = m.value;
    r.getCell(2).style = useResumenStyle ? resumenFinancieroValueStyle(m.color) : totalStyle(m.color);
    r.getCell(2).numFmt = NUM_FMT_ACCOUNTING;
    row += 1;
  }

  return row + 1;
}
