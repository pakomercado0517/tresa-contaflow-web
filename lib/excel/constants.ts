/** Nombres de hojas del workbook */
export const SHEET_NAMES = {
  resumen: "Resumen",
  facturasPendientes: "Facturas Pendientes",
  facturasPagadas: "Facturas Pagadas",
  gastos: "Gastos",
  todasFacturas: "Todas las Facturas",
  perfiles: "Perfiles",
} as const;

/** Colores RGB para Excel (consistentes con PDF) */
export const COLORS = {
  headerBg: "FF2563EB" as const, // blue-600
  white: "FFFFFFFF" as const,
  black: "FF000000" as const,
  gray: "FF969696" as const,
  textGray: "FF4B5563" as const,
  totalFacturado: "FF3B82F6" as const, // blue-500
  totalPagado: "FF22C55E" as const, // green-500
  totalCompras: "FFA855F7" as const, // purple-500
  pendiente: "FFEF4444" as const, // red-500
  diferenciaPositiva: "FF22C55E" as const,
  diferenciaNegativa: "FFEF4444" as const,
  facturasPendientes: {
    title: "FFEAB308" as const,
    header: "FFFACC15" as const,
    alternate: "FFFEF9C3" as const,
  },
  facturasPagadas: {
    title: "FF16A34A" as const,
    header: "FF4ADE80" as const,
    alternate: "FFDCFCE7" as const,
  },
  gastos: {
    title: "FF9333EA" as const,
    header: "FFA78BFA" as const,
    alternate: "FFF3E8FF" as const,
  },
  todasFacturas: {
    title: "FF2563EB" as const,
    header: "FF60A5FA" as const,
    alternate: "FFDBEAFE" as const,
  },
} as const;

/** Anchos de columna sugeridos (en caracteres aproximados) */
export const COLUMN_WIDTHS = {
  uuid: 18,
  fecha: 12,
  rfc: 14,
  nombre: 25,
  concepto: 30,
  categoria: 15,
  tipo: 10,
  subtotal: 12,
  iva: 10,
  total: 12,
  estadoPago: 14,
  origen: 8,
} as const;

/** Altura de fila estándar */
export const ROW_HEIGHT_HEADER = 22;
export const ROW_HEIGHT_DATA = 18;

/** Meses en español */
export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;
