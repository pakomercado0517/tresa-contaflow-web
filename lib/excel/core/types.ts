import type { Invoice } from "@/lib/types/invoices";
import type { Expense } from "@/lib/types/expenses";
import type { Profile } from "@/lib/types/profiles";

/** Métricas financieras para resumen (alineado con PDF) */
export interface ExcelMetrics {
  totalFacturado: number;
  totalPagado: number;
  totalCompras: number;
  pendientePorPagar: number;
  diferencia: number;
  totalFacturas?: number;
  facturasPUE?: number;
  facturasPPD?: number;
}

/** Opciones para exportación completa o por tipo */
export interface ExcelOptions {
  tipo: "completo" | "facturas" | "gastos";
  invoices?: Invoice[];
  expenses?: Expense[];
  profileName?: string;
  rfc?: string;
  mes: number;
  año: number;
  metrics?: ExcelMetrics;
}

/** Opciones para exportar solo facturas */
export interface ExcelInvoicesOptions {
  invoices: Invoice[];
  profileName?: string;
  rfc?: string;
  mes: number;
  año: number;
  metrics?: ExcelMetrics;
}

/** Opciones para exportar solo gastos */
export interface ExcelExpensesOptions {
  expenses: Expense[];
  profileName?: string;
  rfc?: string;
  mes: number;
  año: number;
  metrics?: ExcelMetrics;
}

/** Estadísticas por perfil (reutilizado de pdf-export) */
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

/** Opciones para exportar perfiles */
export interface ExcelProfilesOptions {
  profiles: Profile[];
  profilesStats: ProfileStats[];
}

/** Tipo de sección de facturas */
export type InvoiceSectionType = "pendientes" | "pagadas" | "todas";
