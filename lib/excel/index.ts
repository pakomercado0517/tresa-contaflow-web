/**
 * API pública para exportación a Excel (.xlsx).
 * Carga ExcelJS de forma dinámica para no impactar el bundle inicial.
 */

import type { ExcelOptions, ExcelInvoicesOptions, ExcelExpensesOptions, ExcelProfilesOptions } from "./core/types";
import { validateExcelOptions, validateExcelInvoicesOptions, validateExcelExpensesOptions, validateExcelProfilesOptions } from "./utils/validators";
import { createWorkbook, addWorksheet } from "./core/workbook";
import { SHEET_NAMES, MESES } from "./constants";
import { addHeader } from "./sections/header";
import { addSummary } from "./sections/summary";
import { addInvoicesSection } from "./sections/invoices";
import { addExpensesSection } from "./sections/expenses";
import { addProfilesSection } from "./sections/profiles";
import {
  buildInvoicesSheet,
  buildResumenSheet as buildInvoicesResumenSheet,
} from "./sections/invoices-report";
import {
  buildExpensesSheet,
  buildResumenSheet as buildExpensesResumenSheet,
} from "./sections/expenses-report";

/**
 * Genera el nombre de archivo para reporte financiero.
 */
function getFileName(tipo: "completo" | "facturas" | "gastos", mes: number, año: number): string {
  const tipoTexto = tipo === "completo" ? "completo" : tipo === "facturas" ? "facturas" : "gastos";
  return `contafy-${tipoTexto}-${MESES[mes - 1].toLowerCase()}-${año}.xlsx`;
}

/**
 * Exporta reporte financiero a Excel (completo, solo facturas o solo gastos).
 * Para tipo "facturas" genera 2 hojas: Facturas y Resumen Ejecutivo.
 */
export async function exportToExcel(options: ExcelOptions): Promise<void> {
  validateExcelOptions(options);
  const workbook = createWorkbook("Reporte Contafy");

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

  let titulo = "Reporte Financiero";
  if (tipo === "facturas") titulo = "Reporte de Facturas";
  if (tipo === "gastos") titulo = "Reporte de Gastos";

  if (tipo === "facturas") {
    const periodo =
      mes >= 1 && año >= 1 ? `Período: ${MESES[mes - 1]} ${año}` : "Reporte general";
    const context = { titulo, periodo, rfc };
    const range = buildInvoicesSheet(workbook, invoices, context);
    buildInvoicesResumenSheet(workbook, { context, range });
  } else if (tipo === "gastos") {
    const periodo =
      mes >= 1 && año >= 1 ? `Período: ${MESES[mes - 1]} ${año}` : "Reporte general";
    const context = { titulo, periodo, rfc };
    const range = buildExpensesSheet(workbook, expenses, context);
    buildExpensesResumenSheet(workbook, { context, range });
  } else {
    const sheetResumen = addWorksheet(workbook, SHEET_NAMES.resumen);
    const nextRow = addHeader(sheetResumen, titulo, profileName, rfc, mes, año);
    if (metrics) {
      addSummary(sheetResumen, metrics, nextRow, tipo);
    }

    if (tipo === "completo") {
      const sheetPend = addWorksheet(workbook, SHEET_NAMES.facturasPendientes);
      addHeader(sheetPend, titulo, profileName, rfc, mes, año);
      addInvoicesSection(sheetPend, invoices, "pendientes", 6);

      const sheetPag = addWorksheet(workbook, SHEET_NAMES.facturasPagadas);
      addHeader(sheetPag, titulo, profileName, rfc, mes, año);
      addInvoicesSection(sheetPag, invoices, "pagadas", 6);

      const sheetGastos = addWorksheet(workbook, SHEET_NAMES.gastos);
      addHeader(sheetGastos, titulo, profileName, rfc, mes, año);
      addExpensesSection(sheetGastos, expenses, 6);

      const sheetTodas = addWorksheet(workbook, SHEET_NAMES.todasFacturas);
      addHeader(sheetTodas, titulo, profileName, rfc, mes, año);
      addInvoicesSection(sheetTodas, invoices, "todas", 6);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = getFileName(tipo, mes, año);
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Igual que exportToExcel pero devuelve un Blob.
 */
export async function exportToExcelBlob(options: ExcelOptions): Promise<Blob> {
  validateExcelOptions(options);
  const workbook = createWorkbook("Reporte Contafy");

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

  let titulo = "Reporte Financiero";
  if (tipo === "facturas") titulo = "Reporte de Facturas";
  if (tipo === "gastos") titulo = "Reporte de Gastos";

  if (tipo === "facturas") {
    const periodo =
      mes >= 1 && año >= 1 ? `Período: ${MESES[mes - 1]} ${año}` : "Reporte general";
    const context = { titulo, periodo, rfc };
    const range = buildInvoicesSheet(workbook, invoices, context);
    buildInvoicesResumenSheet(workbook, { context, range });
  } else if (tipo === "gastos") {
    const periodo =
      mes >= 1 && año >= 1 ? `Período: ${MESES[mes - 1]} ${año}` : "Reporte general";
    const context = { titulo, periodo, rfc };
    const range = buildExpensesSheet(workbook, expenses, context);
    buildExpensesResumenSheet(workbook, { context, range });
  } else {
    const sheetResumen = addWorksheet(workbook, SHEET_NAMES.resumen);
    const nextRow = addHeader(sheetResumen, titulo, profileName, rfc, mes, año);
    if (metrics) {
      addSummary(sheetResumen, metrics, nextRow, tipo);
    }

    if (tipo === "completo") {
      const sheetPend = addWorksheet(workbook, SHEET_NAMES.facturasPendientes);
      addHeader(sheetPend, titulo, profileName, rfc, mes, año);
      addInvoicesSection(sheetPend, invoices, "pendientes", 6);

      const sheetPag = addWorksheet(workbook, SHEET_NAMES.facturasPagadas);
      addHeader(sheetPag, titulo, profileName, rfc, mes, año);
      addInvoicesSection(sheetPag, invoices, "pagadas", 6);

      const sheetGastos = addWorksheet(workbook, SHEET_NAMES.gastos);
      addHeader(sheetGastos, titulo, profileName, rfc, mes, año);
      addExpensesSection(sheetGastos, expenses, 6);

      const sheetTodas = addWorksheet(workbook, SHEET_NAMES.todasFacturas);
      addHeader(sheetTodas, titulo, profileName, rfc, mes, año);
      addInvoicesSection(sheetTodas, invoices, "todas", 6);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Exporta solo facturas a Excel.
 */
export async function exportInvoicesToExcel(options: ExcelInvoicesOptions): Promise<void> {
  validateExcelInvoicesOptions(options);
  await exportToExcel({
    tipo: "facturas",
    invoices: options.invoices,
    profileName: options.profileName,
    rfc: options.rfc,
    mes: options.mes,
    año: options.año,
    metrics: options.metrics,
  });
}

/**
 * Exporta solo gastos a Excel.
 */
export async function exportExpensesToExcel(options: ExcelExpensesOptions): Promise<void> {
  validateExcelExpensesOptions(options);
  await exportToExcel({
    tipo: "gastos",
    expenses: options.expenses,
    profileName: options.profileName,
    rfc: options.rfc,
    mes: options.mes,
    año: options.año,
    metrics: options.metrics,
  });
}

/**
 * Exporta perfiles con estadísticas a Excel.
 */
export async function exportProfilesToExcel(options: ExcelProfilesOptions): Promise<void> {
  validateExcelProfilesOptions(options);
  const workbook = createWorkbook("Perfiles Contafy");
  const sheet = addWorksheet(workbook, SHEET_NAMES.perfiles);

  addHeader(sheet, "Reporte de Perfiles RFC", "", "", 0, 0);
  addProfilesSection(sheet, options.profiles, options.profilesStats, 6);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fecha = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contafy-perfiles-${fecha}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export type { ExcelOptions, ExcelInvoicesOptions, ExcelExpensesOptions, ExcelProfilesOptions, ExcelMetrics, ProfileStats } from "./core/types";
