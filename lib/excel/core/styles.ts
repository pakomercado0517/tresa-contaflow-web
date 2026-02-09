import type { Style } from "exceljs";
import { COLORS, CORPORATE } from "../constants";

/**
 * Estilos reutilizables para celdas (consistentes con PDF).
 */

function fillStyle(argb: string): Style["fill"] {
  return {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb },
  };
}

function fontStyle(options: { bold?: boolean; size?: number; color?: string }): Style["font"] {
  const font: Style["font"] = {
    size: options.size ?? 10,
    bold: options.bold ?? false,
  };
  if (options.color) {
    font.color = { argb: options.color };
  }
  return font;
}

/** Encabezado principal del documento (fondo azul, texto blanco) */
export const headerStyle: Partial<Style> = {
  fill: fillStyle(COLORS.headerBg),
  font: fontStyle({ bold: true, size: 12, color: COLORS.white }),
  alignment: { vertical: "middle" },
};

/** Encabezado de tabla (según sección) */
export function tableHeaderStyle(fillArgb: string): Partial<Style> {
  return {
    fill: fillStyle(fillArgb),
    font: fontStyle({ bold: true, size: 10, color: COLORS.black }),
    alignment: { vertical: "middle", wrapText: false },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };
}

/** Fila de datos normal */
export const dataStyle: Partial<Style> = {
  font: fontStyle({ size: 10, color: COLORS.black }),
  alignment: { vertical: "middle" },
  border: {
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
  },
};

/** Fila de datos alternada (fondo claro) */
export function dataAlternateStyle(fillArgb: string): Partial<Style> {
  return {
    ...dataStyle,
    fill: fillStyle(fillArgb),
  };
}

/** Fila de totales */
export function totalStyle(fillArgb: string): Partial<Style> {
  return {
    fill: fillStyle(fillArgb),
    font: fontStyle({ bold: true, size: 10, color: COLORS.black }),
    alignment: { vertical: "middle" },
    border: {
      top: { style: "medium" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };
}

/** Celdas del Resumen Financiero: fondo de color y borde negro fino (estilo imagen Reporte de Facturas) */
const thinBlackBorder = {
  top: { style: "thin" as const, color: { argb: "FF000000" } },
  bottom: { style: "thin" as const, color: { argb: "FF000000" } },
  left: { style: "thin" as const, color: { argb: "FF000000" } },
  right: { style: "thin" as const, color: { argb: "FF000000" } },
};

export function resumenFinancieroValueStyle(fillArgb: string): Partial<Style> {
  return {
    fill: fillStyle(fillArgb),
    font: fontStyle({ bold: true, size: 11, color: COLORS.black }),
    alignment: { vertical: "middle", horizontal: "right" },
    border: thinBlackBorder,
  };
}

/** Aplica estilo a una celda (objeto parcial para no pisar todo el Style) */
export function applyCellStyle(
  cell: { style: Partial<Style> },
  style: Partial<Style>
): void {
  if (style.fill) cell.style.fill = style.fill;
  if (style.font) cell.style.font = { ...cell.style.font, ...style.font };
  if (style.alignment) cell.style.alignment = { ...cell.style.alignment, ...style.alignment };
  if (style.border) cell.style.border = { ...cell.style.border, ...style.border };
  if (style.numFmt) cell.style.numFmt = style.numFmt;
}

/** Formato numérico para moneda en Excel */
export const NUM_FMT_CURRENCY = '"$"#,##0.00';
/** Formato contable: miles, decimales, negativos entre paréntesis */
export const NUM_FMT_ACCOUNTING = '"$"#,##0.00;("$"#,##0.00);"$"0.00;@';
/** Formato de fecha corta */
export const NUM_FMT_DATE = "dd/mm/yyyy";
/** Formato fecha y hora */
export const NUM_FMT_DATETIME = "dd/mm/yyyy hh:mm";

/** Encabezado corporativo (teal oscuro, texto blanco, centrado) - estilo imagen */
export const corporateTableHeaderStyle: Partial<Style> = {
  fill: fillStyle(CORPORATE.headerTeal),
  font: fontStyle({ bold: true, size: 11, color: COLORS.white }),
  alignment: { horizontal: "center", vertical: "middle", wrapText: true },
  border: {
    top: { style: "thin", color: { argb: CORPORATE.borderGray } },
    bottom: { style: "thin", color: { argb: CORPORATE.borderGray } },
    left: { style: "thin", color: { argb: CORPORATE.borderGray } },
    right: { style: "thin", color: { argb: CORPORATE.borderGray } },
  },
};

/** Celda de Total CFDI (fondo verde, texto blanco, negrita) */
export const totalCfdiCellStyle: Partial<Style> = {
  fill: fillStyle(CORPORATE.totalCfdiGreen),
  font: fontStyle({ bold: true, size: 10, color: COLORS.white }),
  alignment: { horizontal: "right", vertical: "middle" },
  border: {
    bottom: { style: "thin", color: { argb: CORPORATE.borderGray } },
    left: { style: "thin", color: { argb: CORPORATE.borderGray } },
    right: { style: "thin", color: { argb: CORPORATE.borderGray } },
  },
};

/** Estado VIGENTE (fondo verde, texto blanco) */
export const estadoVigenteStyle: Partial<Style> = {
  fill: fillStyle(CORPORATE.estadoVigente),
  font: fontStyle({ bold: true, size: 10, color: COLORS.white }),
  alignment: { horizontal: "center", vertical: "middle" },
  border: {
    bottom: { style: "thin", color: { argb: CORPORATE.borderGray } },
    left: { style: "thin", color: { argb: CORPORATE.borderGray } },
    right: { style: "thin", color: { argb: CORPORATE.borderGray } },
  },
};

/** Estado CANCELADO / con errores (fondo rojo, texto blanco) */
export const estadoCanceladoStyle: Partial<Style> = {
  fill: fillStyle(CORPORATE.estadoCancelado),
  font: fontStyle({ bold: true, size: 10, color: COLORS.white }),
  alignment: { horizontal: "center", vertical: "middle" },
  border: {
    bottom: { style: "thin", color: { argb: CORPORATE.borderGray } },
    left: { style: "thin", color: { argb: CORPORATE.borderGray } },
    right: { style: "thin", color: { argb: CORPORATE.borderGray } },
  },
};

/** Fila de datos corporativa (bordes, sin relleno o alternado) */
export function corporateDataRowStyle(alternate: boolean): Partial<Style> {
  return {
    font: fontStyle({ size: 10, color: COLORS.black }),
    alignment: { vertical: "middle", wrapText: true },
    fill: alternate ? fillStyle(CORPORATE.rowAlternate) : undefined,
    border: {
      bottom: { style: "thin", color: { argb: CORPORATE.borderGray } },
      left: { style: "thin", color: { argb: CORPORATE.borderGray } },
      right: { style: "thin", color: { argb: CORPORATE.borderGray } },
    },
  };
}
