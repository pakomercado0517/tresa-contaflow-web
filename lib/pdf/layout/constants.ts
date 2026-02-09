export const PAGE = {
  size: 'a4' as const,
  orientation: 'portrait' as const,
  unit: 'mm' as const,
};

export const MARGINS = {
  left: 15,
  right: 15,
  header: 25,
  footer: 20,
};

/** Dimensiones para el reporte mensual (exportación HTML → PDF) */
export const REPORT = {
  headerHeightMm: 12,
  // Subimos el footer 3mm para evitar cortes/traslapes por redondeo de renderizado.
  footerHeightMm: 18,
  /** Área de contenido por página = 297 - header - footer = 267mm */
  contentHeightMm: 267,
};

export const COLORS = {
  headerBg: [37, 99, 235] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  gray: [150, 150, 150] as [number, number, number],
  text: [75, 85, 99] as [number, number, number],
  /** Portal de Reportes - emerald */
  emerald: [16, 185, 129] as [number, number, number],
  grayDark: [75, 85, 99] as [number, number, number],
  grayLight: [148, 163, 184] as [number, number, number],
};
