/**
 * Utilidad para exportar datos financieros a PDF
 * Sigue el diseño especificado en docs/ESTILO_EXPORTACION_PDF.md
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "@/lib/types/invoices";
import type { Expense } from "@/lib/types/expenses";
import type { Profile } from "@/lib/types/profiles";

// ==================== COLORES ====================
const COLORS = {
  // Header
  headerBg: [37, 99, 235] as [number, number, number], // blue-600
  
  // Resumen
  totalFacturado: [59, 130, 246] as [number, number, number], // blue-500
  totalPagado: [34, 197, 94] as [number, number, number], // green-500
  totalCompras: [168, 85, 247] as [number, number, number], // purple-500
  pendiente: [239, 68, 68] as [number, number, number], // red-500
  diferenciaPositiva: [34, 197, 94] as [number, number, number], // green-500
  diferenciaNegativa: [239, 68, 68] as [number, number, number], // red-500
  
  // Secciones
  facturasPendientes: {
    title: [234, 179, 8] as [number, number, number], // yellow-600
    header: [250, 204, 21] as [number, number, number], // yellow-400
    alternate: [254, 249, 195] as [number, number, number], // yellow-100
  },
  facturasPagadas: {
    title: [22, 163, 74] as [number, number, number], // green-600
    header: [74, 222, 128] as [number, number, number], // green-400
    alternate: [220, 252, 231] as [number, number, number], // green-100
  },
  gastos: {
    title: [147, 51, 234] as [number, number, number], // purple-600
    header: [167, 139, 250] as [number, number, number], // purple-400
    alternate: [243, 232, 255] as [number, number, number], // purple-100
  },
  todasFacturas: {
    title: [37, 99, 235] as [number, number, number], // blue-600
    header: [96, 165, 250] as [number, number, number], // blue-400
    alternate: [219, 234, 254] as [number, number, number], // blue-100
  },
  
  // Utilidades
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  gray: [150, 150, 150] as [number, number, number],
  textGray: [75, 85, 99] as [number, number, number],
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ==================== TIPOS ====================
interface PDFOptions {
  tipo: "completo" | "facturas" | "gastos";
  invoices?: Invoice[];
  expenses?: Expense[];
  profileName?: string;
  rfc?: string;
  mes: number;
  año: number;
  metrics?: {
    totalFacturado: number;
    totalPagado: number;
    totalCompras: number;
    pendientePorPagar: number;
    diferencia: number;
    totalFacturas?: number;
    facturasPUE?: number;
    facturasPPD?: number;
  };
}

export interface ProfileStats {
  profileId: string;
  totalInvoices: number;
  totalExpenses: number;
  totalInvoiced: number;
  totalSpent: number;
  firstInvoiceDate: string | null;
  lastInvoiceDate: string | null;
  firstExpenseDate: string | null;
  lastExpenseDate: string | null;
}

interface ProfileWithStats extends Profile {
  stats: ProfileStats;
}

interface ExportProfilesOptions {
  profiles: Profile[];
  profilesStats: ProfileStats[];
}

// ==================== UTILIDADES ====================
function toNumber(value: number | string): number {
  return typeof value === "number" ? value : parseFloat(String(value)) || 0;
}

function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (typeof numAmount !== "number" || isNaN(numAmount)) {
    return "$0.00";
  }
  return `$${numAmount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Normaliza facturas para exportación PDF (total y pagos[].monto como number). */
export function normalizeInvoicesForExport(invoices: Invoice[]): Invoice[] {
  return invoices.map((inv) => ({
    ...inv,
    total: toNumber(inv.total),
    pagos: (inv.pagos ?? []).map((p) => ({
      ...p,
      monto: toNumber(p.monto),
    })),
  }));
}

/** Normaliza gastos para exportación PDF (total como number). */
export function normalizeExpensesForExport(expenses: Expense[]): Expense[] {
  return expenses.map((exp) => ({
    ...exp,
    total: toNumber(exp.total),
  }));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX");
}

function getPaidAmount(invoice: Invoice): number {
  if (invoice.tipo === "PUE") {
    return invoice.total;
  }

  if (!invoice.pagos || invoice.pagos.length === 0) {
    return 0;
  }

  return invoice.pagos.reduce((sum, pago) => sum + pago.monto, 0);
}

function getComplementCount(invoice: Invoice): number {
  if (invoice.tipo === "PPD") {
    return invoice.pagos?.length ?? 0;
  }

  if (invoice.tipo === "COMPLEMENTO_PAGO") {
    return invoice.complemento_pago?.facturasRelacionadas?.length ?? 0;
  }

  return 0;
}

function getComplementLabel(invoice: Invoice): string {
  if (invoice.tipo === "PPD") {
    const count = getComplementCount(invoice);
    return count > 0 ? `Con pagos (${count})` : "-";
  }

  if (invoice.tipo === "COMPLEMENTO_PAGO") {
    return `Rel: ${getComplementCount(invoice)}`;
  }

  return "-";
}

function getPendingAmount(invoice: Invoice): number {
  if (invoice.tipo !== "PUE" && invoice.tipo !== "PPD") {
    return 0;
  }

  const pendiente = invoice.total - getPaidAmount(invoice);
  return pendiente > 0 ? pendiente : 0;
}

function formatAmountOrDash(amount: number, shouldShow: boolean): string {
  return shouldShow ? formatCurrency(amount) : "-";
}

function isComplementoOrphan(invoice: Invoice, invoices: Invoice[]): boolean {
  if (invoice.tipo !== "COMPLEMENTO_PAGO") return false;
  const relatedUuids =
    invoice.complemento_pago?.facturasRelacionadas?.map((rel) => rel.uuid) || [];

  if (relatedUuids.length === 0) return true;

  return !invoices.some((item) => relatedUuids.includes(item.uuid));
}

function isInvoicePending(invoice: Invoice): boolean {
  if (invoice.tipo !== "PPD") return false;
  const pagado = getPaidAmount(invoice);
  return pagado < invoice.total;
}

function isInvoicePaid(invoice: Invoice): boolean {
  if (invoice.tipo === "PUE") return true;
  if (invoice.tipo !== "PPD") return false;
  const pagado = getPaidAmount(invoice);
  return pagado >= invoice.total && invoice.total > 0;
}

function lightenColor(color: [number, number, number], percent: number): [number, number, number] {
  return [
    Math.min(255, Math.round(color[0] + (255 - color[0]) * percent)),
    Math.min(255, Math.round(color[1] + (255 - color[1]) * percent)),
    Math.min(255, Math.round(color[2] + (255 - color[2]) * percent)),
  ];
}

// ==================== HEADER ====================
function addHeader(
  doc: jsPDF,
  titulo: string,
  profileName: string,
  rfc: string,
  mes: number,
  año: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Fondo azul
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Título principal
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 15, 22);
  
  // Período
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${MESES[mes - 1]} ${año}`, 15, 38);
  
  // Información del perfil (lado derecho)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const profileText = profileName || "Todos los perfiles";
  const profileWidth = doc.getTextWidth(profileText);
  doc.text(profileText, pageWidth - profileWidth - 15, 18);
  
  if (rfc) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const rfcText = `RFC: ${rfc}`;
    const rfcWidth = doc.getTextWidth(rfcText);
    doc.text(rfcText, pageWidth - rfcWidth - 15, 28);
  }
  
  // Fecha de generación
  doc.setFontSize(8);
  const fechaText = `Generado: ${new Date().toLocaleDateString("es-MX")}`;
  const fechaWidth = doc.getTextWidth(fechaText);
  doc.text(fechaText, pageWidth - fechaWidth - 15, 38);
  
  return 60; // Posición Y después del header (más espacio)
}

// ==================== RESUMEN FINANCIERO ====================
function addResumenFinanciero(
  doc: jsPDF,
  y: number,
  metrics: PDFOptions["metrics"],
  tipo: "completo" | "facturas" | "gastos"
): number {
  if (!metrics) return y;
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  // Título de sección
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.black);
  doc.text("Resumen Financiero", margin, y);
  y += 15;
  
  // Configurar métricas según tipo
  let metricsToShow: Array<{
    label: string;
    value: number;
    color: [number, number, number];
  }> = [];
  
  if (tipo === "completo") {
    // 5 métricas en 2 filas (3 + 2)
    metricsToShow = [
      { label: "Total Facturado", value: metrics.totalFacturado, color: COLORS.totalFacturado },
      { label: "Total Pagado", value: metrics.totalPagado, color: COLORS.totalPagado },
      { label: "Total Compras", value: metrics.totalCompras, color: COLORS.totalCompras },
      { label: "Pendiente por Pagar", value: metrics.pendientePorPagar, color: COLORS.pendiente },
      { 
        label: "Diferencia Ingresos - Gastos", 
        value: metrics.diferencia, 
        color: metrics.diferencia >= 0 ? COLORS.diferenciaPositiva : COLORS.diferenciaNegativa 
      },
    ];
  } else if (tipo === "facturas") {
    // 3 métricas de facturas
    metricsToShow = [
      { label: "Total Facturado", value: metrics.totalFacturado, color: COLORS.totalFacturado },
      { label: "Total Pagado", value: metrics.totalPagado, color: COLORS.totalPagado },
      { label: "Pendiente por Pagar", value: metrics.pendientePorPagar, color: COLORS.pendiente },
    ];
  } else if (tipo === "gastos") {
    // 1 métrica de gastos
    metricsToShow = [
      { label: "Total Gastos", value: metrics.totalCompras, color: COLORS.totalCompras },
    ];
  }
  
  // Primera fila (3 cajas)
  const boxWidth = (contentWidth - 20) / 3;
  const boxHeight = 32;
  const firstRowMetrics = metricsToShow.slice(0, 3);
  
  firstRowMetrics.forEach((metric, index) => {
    const x = margin + index * (boxWidth + 10);
    
    // Fondo claro (85% más claro)
    const lightColor = lightenColor(metric.color, 0.85);
    doc.setFillColor(...lightColor);
    doc.rect(x, y, boxWidth, boxHeight, "F");
    
    // Borde con color base
    doc.setDrawColor(...metric.color);
    doc.setLineWidth(0.5);
    doc.rect(x, y, boxWidth, boxHeight, "S");
    
    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textGray);
    doc.text(metric.label, x + 5, y + 12);
    
    // Valor
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...metric.color);
    const valorTexto = formatCurrency(metric.value);
    doc.text(valorTexto, x + 5, y + 24);
  });
  
  y += boxHeight + 10;
  
  // Segunda fila (2 cajas centradas) - solo para reporte completo
  if (metricsToShow.length > 3) {
    const secondRowMetrics = metricsToShow.slice(3);
    const offsetX = (contentWidth - (boxWidth * 2 + 10)) / 2;
    
    secondRowMetrics.forEach((metric, index) => {
      const x = margin + offsetX + index * (boxWidth + 10);
      
      const lightColor = lightenColor(metric.color, 0.85);
      doc.setFillColor(...lightColor);
      doc.rect(x, y, boxWidth, boxHeight, "F");
      
      doc.setDrawColor(...metric.color);
      doc.setLineWidth(0.5);
      doc.rect(x, y, boxWidth, boxHeight, "S");
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textGray);
      doc.text(metric.label, x + 5, y + 12);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...metric.color);
      const valorTexto = formatCurrency(metric.value);
      doc.text(valorTexto, x + 5, y + 24);
    });
    
    y += boxHeight + 15;
  } else {
    y += 5;
  }
  
  return y;
}

// ==================== FACTURAS PENDIENTES ====================
function addFacturasPendientes(doc: jsPDF, y: number, invoices: Invoice[]): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Filtrar facturas pendientes (PPD no completamente pagadas)
  const facturasPendientes = invoices.filter((inv) => isInvoicePending(inv));
  
  if (facturasPendientes.length === 0) return y;
  
  // Verificar espacio
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin + 10;
  }
  
  // Título de sección
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.facturasPendientes.title);
  doc.text("FACTURAS PENDIENTES POR PAGAR", margin, y);
  y += 10;
  
  // Preparar datos para tabla
  const tableData = facturasPendientes.map((inv) => {
    const totalPagado = getPaidAmount(inv);
    const pendiente = inv.total - totalPagado;
    
    return [
      inv.uuid?.substring(0, 8) + "..." || "N/A",
      formatDate(inv.fecha),
      formatCurrency(inv.total),
      formatCurrency(totalPagado),
      formatCurrency(pendiente),
      getComplementLabel(inv),
      inv.rfc_emisor || "N/A",
    ];
  });
  
  autoTable(doc, {
    startY: y,
    head: [
      ["UUID", "Fecha", "Total", "Pagado", "Pendiente", "Complementos", "RFC Emisor"],
    ],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.facturasPendientes.header,
      textColor: COLORS.black,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.facturasPendientes.alternate,
    },
    margin: { left: margin, right: margin },
    pageBreak: "auto",
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY;
  return finalY ? finalY + 15 : y + 15;
}

// ==================== FACTURAS PAGADAS ====================
function addFacturasPagadas(doc: jsPDF, y: number, invoices: Invoice[]): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Filtrar facturas pagadas (PUE + PPD completamente pagadas)
  const facturasPagadas = invoices.filter((inv) => isInvoicePaid(inv));
  
  if (facturasPagadas.length === 0) return y;
  
  // Verificar espacio
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin + 10;
  }
  
  // Título de sección
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.facturasPagadas.title);
  doc.text("FACTURAS PAGADAS", margin, y);
  y += 10;
  
  // Preparar datos para tabla
  const tableData = facturasPagadas.map((inv) => {
    const totalPagado = getPaidAmount(inv);

    return [
      inv.uuid?.substring(0, 8) + "..." || "N/A",
      formatDate(inv.fecha),
      inv.tipo || "N/A",
      formatCurrency(inv.total),
      formatCurrency(totalPagado),
      getComplementLabel(inv),
      inv.rfc_emisor || "N/A",
    ];
  });
  
  autoTable(doc, {
    startY: y,
    head: [
      ["UUID", "Fecha", "Tipo", "Total", "Pagado", "Complementos", "RFC Emisor"],
    ],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.facturasPagadas.header,
      textColor: COLORS.black,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.facturasPagadas.alternate,
    },
    margin: { left: margin, right: margin },
    pageBreak: "auto",
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY;
  return finalY ? finalY + 15 : y + 15;
}

// ==================== GASTOS ====================
function addGastos(doc: jsPDF, y: number, expenses: Expense[]): number {
  if (expenses.length === 0) return y;
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Verificar espacio
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin + 10;
  }
  
  // Título de sección
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gastos.title);
  doc.text("GASTOS", margin, y);
  y += 10;
  
  // Calcular total
  const totalGastos = expenses.reduce((sum, exp) => sum + exp.total, 0);
  
  // Preparar datos para tabla
  const tableData = expenses.map((exp) => [
    exp.tipo_origen === "XML" ? "XML" : "MANUAL",
    formatDate(exp.fecha),
    formatCurrency(exp.total),
    (exp.concepto || "Sin concepto").substring(0, 30),
    exp.rfc_emisor || "N/A",
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [["Origen", "Fecha", "Total", "Concepto", "RFC Proveedor"]],
    body: tableData,
    foot: [["TOTAL", "", formatCurrency(totalGastos), "", ""]],
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.gastos.header,
      textColor: COLORS.black,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: COLORS.gastos.header,
      textColor: COLORS.black,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.gastos.alternate,
    },
    margin: { left: margin, right: margin },
    pageBreak: "auto",
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY;
  return finalY ? finalY + 15 : y + 15;
}

// ==================== TODAS LAS FACTURAS ====================
function addTodasLasFacturas(doc: jsPDF, y: number, invoices: Invoice[]): number {
  const visibleInvoices = invoices.filter(
    (inv) => inv.tipo !== "COMPLEMENTO_PAGO" || isComplementoOrphan(inv, invoices)
  );

  if (visibleInvoices.length === 0) return y;
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Verificar espacio
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin + 10;
  }
  
  // Título de sección
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.todasFacturas.title);
  doc.text("TODAS LAS FACTURAS", margin, y);
  y += 10;
  
  // Preparar datos para tabla
  const tableData = visibleInvoices.map((inv) => [
    inv.uuid?.substring(0, 8) + "..." || "N/A",
    formatDate(inv.fecha),
    inv.tipo || "N/A",
    formatCurrency(inv.total),
    formatAmountOrDash(getPaidAmount(inv), inv.tipo !== "COMPLEMENTO_PAGO"),
    formatAmountOrDash(getPendingAmount(inv), inv.tipo !== "COMPLEMENTO_PAGO"),
    getComplementLabel(inv),
    inv.rfc_emisor || "N/A",
    inv.rfc_receptor || "N/A",
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [
      [
        "UUID",
        "Fecha",
        "Tipo",
        "Total",
        "Pagado",
        "Pendiente",
        "Complementos",
        "RFC Emisor",
        "RFC Receptor",
      ],
    ],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.todasFacturas.header,
      textColor: COLORS.black,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.todasFacturas.alternate,
    },
    margin: { left: margin, right: margin },
    pageBreak: "auto",
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY;
  return finalY ? finalY + 15 : y + 15;
}

// ==================== FOOTER ====================
function addFooter(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }
}

// ==================== FUNCIÓN PRINCIPAL ====================
export async function exportToPDF(options: PDFOptions): Promise<void> {
  const {
    tipo,
    invoices = [],
    expenses = [],
    profileName = "Todos los perfiles",
    rfc = "",
    mes,
    año,
    metrics,
  } = options;
  
  // Crear documento
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });
  
  // Determinar título según tipo
  let titulo = "Reporte Financiero";
  if (tipo === "facturas") titulo = "Reporte de Facturas";
  if (tipo === "gastos") titulo = "Reporte de Gastos";
  
  // Agregar header
  let y = addHeader(doc, titulo, profileName, rfc, mes, año);
  
  // Agregar resumen financiero
  if (metrics) {
    y = addResumenFinanciero(doc, y, metrics, tipo);
  }
  
  // Agregar secciones según tipo
  if (tipo === "completo") {
    // Orden: Pendientes → Pagadas → Gastos → Todas
    y = addFacturasPendientes(doc, y, invoices);
    y = addFacturasPagadas(doc, y, invoices);
    y = addGastos(doc, y, expenses);
    y = addTodasLasFacturas(doc, y, invoices);
  } else if (tipo === "facturas") {
    // Solo facturas: Pendientes → Pagadas → Todas
    y = addFacturasPendientes(doc, y, invoices);
    y = addFacturasPagadas(doc, y, invoices);
    y = addTodasLasFacturas(doc, y, invoices);
  } else if (tipo === "gastos") {
    // Solo gastos
    addGastos(doc, y, expenses);
  }
  
  // Agregar footer
  addFooter(doc);
  
  // Generar nombre de archivo
  const tipoTexto = tipo === "completo" ? "completo" : tipo === "facturas" ? "facturas" : "gastos";
  const fileName = `contaflow-${tipoTexto}-${MESES[mes - 1].toLowerCase()}-${año}.pdf`;
  
  // Descargar
  doc.save(fileName);
}

// ==================== EXPORTACIÓN DE PERFILES ====================

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function addProfilesHeader(doc: jsPDF): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const fechaGeneracion = formatDateShort(now.toISOString());
  
  // Fondo azul
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Título principal
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Perfiles RFC", 15, 22);
  
  // Fecha de generación
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado el ${fechaGeneracion}`, 15, 38);
  
  return 70;
}

function addProfilesResumen(doc: jsPDF, y: number, profiles: Profile[]): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Título
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen General", 15, y);
  y += 20;
  
  // Cajas de resumen
  const boxWidth = (pageWidth - 45) / 2;
  const boxHeight = 50;
  
  // Total de perfiles
  doc.setFillColor(219, 234, 254); // blue-100
  doc.rect(15, y, boxWidth, boxHeight, "F");
  doc.setDrawColor(96, 165, 250); // blue-400
  doc.rect(15, y, boxWidth, boxHeight, "S");
  
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total de Perfiles", 25, y + 15);
  doc.setFontSize(18);
  doc.text(profiles.length.toString(), 25, y + 35);
  
  // Perfiles activos (con facturas o gastos)
  doc.setFillColor(220, 252, 231); // green-100
  doc.rect(30 + boxWidth, y, boxWidth, boxHeight, "F");
  doc.setDrawColor(74, 222, 128); // green-400
  doc.rect(30 + boxWidth, y, boxWidth, boxHeight, "S");
  
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Perfiles Activos", 40 + boxWidth, y + 15);
  doc.setFontSize(18);
  
  // Por ahora todos los perfiles se consideran activos
  // En el futuro se puede filtrar por perfiles con facturas o gastos
  const profilesActive = profiles.length;
  
  doc.text(profilesActive.toString(), 40 + boxWidth, y + 35);
  
  return y + boxHeight + 25;
}

function formatValidationStatus(
  validaciones: Record<string, unknown>,
  key: string
): string {
  const value = validaciones[key];
  if (typeof value === "boolean") {
    return value ? "✓" : "✗";
  }
  return "-";
}

function addProfileDetail(
  doc: jsPDF,
  y: number,
  profile: ProfileWithStats
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  
  // Si no cabe en la página, agregar nueva
  if (y > pageHeight - 200) {
    doc.addPage();
    y = addProfilesHeader(doc);
  }
  
  // Fondo del perfil
  doc.setFillColor(249, 250, 251); // gray-50
  doc.rect(margin, y, contentWidth, 180, "F");
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.rect(margin, y, contentWidth, 180, "S");
  
  let currentY = y + 15;
  
  // RFC y Nombre
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`[${profile.rfc}] - ${profile.nombre}`, margin + 10, currentY);
  currentY += 20;
  
  // Tipo de Persona y Régimen Fiscal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textGray);
  const tipoPersona = profile.tipo_persona === "FISICA" ? "Persona Física" : "Persona Moral";
  doc.text(`Tipo: ${tipoPersona}`, margin + 10, currentY);
  
  if (profile.regimenes_fiscales?.length > 0) {
    const regimenesText =
      profile.regimenes_fiscales.length > 1
        ? profile.regimenes_fiscales.join(", ")
        : profile.regimenes_fiscales[0];
    doc.text(`Régimen${profile.regimenes_fiscales.length > 1 ? "es" : ""} Fiscal${profile.regimenes_fiscales.length > 1 ? "es" : ""}: ${regimenesText}`, margin + 200, currentY);
  }
  currentY += 15;
  
  // Fechas
  const fechaCreacion = formatDateShort(profile.created_at);
  const fechaActualizacion = formatDateShort(profile.updated_at);
  doc.text(`Creado: ${fechaCreacion}`, margin + 10, currentY);
  doc.text(`Actualizado: ${fechaActualizacion}`, margin + 200, currentY);
  currentY += 25;
  
  // Estadísticas
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.black);
  doc.text("Estadísticas:", margin + 10, currentY);
  currentY += 15;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textGray);
  
  const stats = profile.stats;
  doc.text(`• Total Facturas: ${stats.totalInvoices}`, margin + 10, currentY);
  doc.text(`• Total Gastos: ${stats.totalExpenses}`, margin + 200, currentY);
  currentY += 12;
  
  if (stats.totalInvoiced > 0) {
    doc.text(`• Total Facturado: ${formatCurrency(stats.totalInvoiced)}`, margin + 10, currentY);
  }
  if (stats.totalSpent > 0) {
    doc.text(`• Total en Gastos: ${formatCurrency(stats.totalSpent)}`, margin + 200, currentY);
  }
  currentY += 12;
  
  if (stats.firstInvoiceDate || stats.firstExpenseDate) {
    const firstDate = stats.firstInvoiceDate || stats.firstExpenseDate;
    const lastDate = stats.lastInvoiceDate || stats.lastExpenseDate;
    
    if (firstDate) {
      doc.text(`• Primer Registro: ${formatDateShort(firstDate)}`, margin + 10, currentY);
    }
    if (lastDate) {
      doc.text(`• Último Registro: ${formatDateShort(lastDate)}`, margin + 200, currentY);
    }
    currentY += 12;
  }
  currentY += 10;
  
  // Validaciones Habilitadas
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.black);
  doc.text("Validaciones Habilitadas:", margin + 10, currentY);
  currentY += 15;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textGray);
  
  const validaciones = profile.validaciones_habilitadas;
  const validationKeys = [
    { key: "validarRFCIngresos", label: "Validar RFC Ingresos" },
    { key: "validarRFCGastos", label: "Validar RFC Gastos" },
    { key: "validarRegimenFiscal", label: "Validar Régimen Fiscal" },
    { key: "validarUUIDDuplicado", label: "Validar UUID Duplicado" },
  ];
  
  let validationY = currentY;
  for (const validation of validationKeys) {
    const status = formatValidationStatus(validaciones, validation.key);
    doc.text(`${status} ${validation.label}`, margin + 10, validationY);
    validationY += 10;
  }
  
  return y + 180 + 20;
}

/**
 * Exporta perfiles a PDF con estadísticas
 * @param options - Opciones de exportación
 */
export async function exportProfilesToPDF(
  options: ExportProfilesOptions
): Promise<void> {
  const { profiles, profilesStats } = options;
  
  // Crear documento
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });
  
  // Combinar perfiles con estadísticas
  const profilesWithStats: ProfileWithStats[] = profiles.map((profile) => {
    const stats = profilesStats.find((s) => s.profileId === profile.id);
    return {
      ...profile,
      stats: stats || {
        profileId: profile.id,
        totalInvoices: 0,
        totalExpenses: 0,
        totalInvoiced: 0,
        totalSpent: 0,
        firstInvoiceDate: null,
        lastInvoiceDate: null,
        firstExpenseDate: null,
        lastExpenseDate: null,
      },
    };
  });
  
  // Agregar header
  let y = addProfilesHeader(doc);
  
  // Agregar resumen
  y = addProfilesResumen(doc, y, profiles);
  
  // Agregar detalle por perfil
  for (const profile of profilesWithStats) {
    y = addProfileDetail(doc, y, profile);
  }
  
  // Agregar footer
  addFooter(doc);
  
  // Generar nombre de archivo
  const now = new Date();
  const fecha = now.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");
  const fileName = `contaflow-perfiles-${fecha}.pdf`;
  
  // Descargar
  doc.save(fileName);
}
