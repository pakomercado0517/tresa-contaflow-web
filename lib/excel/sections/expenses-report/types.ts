import type { Expense } from "@/lib/types/expenses";

export interface ExpensesReportContext {
  titulo: string;
  periodo: string;
  rfc: string;
}

export interface HeaderMetadata {
  title: string;
  period: string;
  rfc: string;
}

export interface ExpensesSheetBuildResult {
  dataStartRow: number;
  dataEndRow: number;
}

export interface ExpensesReportData {
  expenses: Expense[];
  context: ExpensesReportContext;
}
