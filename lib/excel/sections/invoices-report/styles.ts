/**
 * Estilos corporativos minimalistas para el reporte de facturas (uso contable).
 * Sin colores fuertes, gris claro solo en encabezados, bordes finos.
 */

import type { Style } from "exceljs";
import type { Worksheet } from "exceljs";

const FONT_NAME = "Calibri";
const HEADER_BG = "FFF2F2F2"; // gris claro solicitado
const BORDER_THIN = { style: "thin" as const, color: { argb: "FFD1D5DB" } };
const BORDER_MEDIUM = { style: "medium" as const, color: { argb: "FF9CA3AF" } };

function fill(argb: string): Style["fill"] {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

/** Encabezado de tabla: negrita, fondo gris claro, bordes finos */
export const tableHeaderStyle: Partial<Style> = {
  font: { name: FONT_NAME, size: 11, bold: true },
  fill: fill(HEADER_BG),
  alignment: { vertical: "middle", horizontal: "left" },
  border: {
    top: BORDER_THIN,
    bottom: BORDER_THIN,
    left: BORDER_THIN,
    right: BORDER_THIN,
  },
};

/** Fila de datos: sin fondo, bordes finos */
export const dataRowStyle: Partial<Style> = {
  font: { name: FONT_NAME, size: 11 },
  alignment: { vertical: "middle", wrapText: true },
  border: {
    bottom: BORDER_THIN,
    left: BORDER_THIN,
    right: BORDER_THIN,
  },
};

/** Título del reporte (fila 1): negrita, sin fondo llamativo */
export const reportTitleStyle: Partial<Style> = {
  font: { name: FONT_NAME, size: 14, bold: true },
};

/** Fila de metadatos (periodo, RFC): texto normal */
export const metaRowStyle: Partial<Style> = {
  font: { name: FONT_NAME, size: 11 },
};

/** Formato contable para montos (no texto) */
export const NUM_FMT_ACCOUNTING = '"$"#,##0.00';

/** Línea divisoria fina (fila 4 del encabezado) */
export const dividerBottomBorder: Partial<Style> = {
  border: {
    bottom: BORDER_THIN,
  },
};

/** Separador de bloque de totales (borde superior grueso) */
export const totalsSectionTopBorder: Partial<Style> = {
  border: {
    top: BORDER_MEDIUM,
  },
};

/** Ajusta ancho de columnas por contenido para uso contable */
export function autoFitColumns(
  worksheet: Worksheet,
  options?: { minWidth?: number; maxWidth?: number }
): void {
  const minWidth = options?.minWidth ?? 10;
  const maxWidth = options?.maxWidth ?? 45;

  worksheet.columns.forEach((column) => {
    const letter = column.letter;
    if (!letter || !column.eachCell) return;

    let maxLength = minWidth;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const raw = cell.value;
      let text = "";

      if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
        text = String(raw);
      } else if (raw && typeof raw === "object" && "formula" in raw) {
        text = String(raw.formula ?? "");
      } else if (raw && typeof raw === "object" && "richText" in raw) {
        text = "";
      }

      if (text.length > maxLength) {
        maxLength = text.length;
      }
    });

    worksheet.getColumn(letter).width = Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
  });
}
