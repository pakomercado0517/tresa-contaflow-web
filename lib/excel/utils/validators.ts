import type { ExcelOptions, ExcelProfilesOptions } from "../core/types";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Valida opciones para exportación completa/facturas/gastos.
 */
export function validateExcelOptions(options: ExcelOptions): void {
  assert(options.mes >= 1 && options.mes <= 12, "mes debe estar entre 1 y 12");
  assert(Number.isInteger(options.año) && options.año > 0, "año debe ser un entero positivo");

  if (options.tipo === "completo" || options.tipo === "facturas") {
    assert(Array.isArray(options.invoices), "invoices debe ser un array");
  }
  if (options.tipo === "completo" || options.tipo === "gastos") {
    assert(Array.isArray(options.expenses), "expenses debe ser un array");
  }
}

/**
 * Valida opciones para exportar perfiles.
 */
export function validateExcelProfilesOptions(options: ExcelProfilesOptions): void {
  assert(Array.isArray(options.profiles), "profiles es requerido y debe ser un array");
  assert(Array.isArray(options.profilesStats), "profilesStats es requerido y debe ser un array");
}
