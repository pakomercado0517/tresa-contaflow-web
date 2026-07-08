import type { Invoice } from '@/lib/types/invoices';
import type { ManualIncome } from '@/lib/types/manual-incomes';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

export interface InvoicesListUiState {
  search: string;
  selectedProfileId: string;
  selectedMes: number;
  selectedAño: number;
  selectedRegimenFiscal: string;
  isInitialLoad: boolean;
  invoiceToDelete: Invoice | null;
  deleteError: string | null;
  deleteConfirmation: string;
  isDeleting: boolean;
  addManualIncomeOpen: boolean;
  manualIncomeConcept: string;
  manualIncomeSubtotal: string;
  manualIncomeIva: string;
  manualIncomeFecha: string;
  manualIncomeNotes: string;
  manualIncomeFormError: string | null;
  editingManualIncome: ManualIncome | null;
  manualIncomeIsPaid: boolean;
  manualIncomePaymentDate: string;
  manualIncomeToDelete: ManualIncome | null;
  manualIncomeDeleteConfirmation: string;
  manualIncomeDeleteError: string | null;
  isDeletingManualIncome: boolean;
}

export interface InvoicesListUiInit {
  initialSearch?: string;
  initialProfileId?: string;
  initialMes?: number;
  initialAño?: number;
  initialRegimenFiscal?: string;
}

export function createInitialInvoicesListUiState(init: InvoicesListUiInit): InvoicesListUiState {
  const { mes: appMes, año: appAño } = getCurrentMonthYearInAppTimezone();
  return {
    search: init.initialSearch ?? '',
    selectedProfileId: init.initialProfileId ?? 'all',
    selectedMes: init.initialMes ?? appMes,
    selectedAño: init.initialAño ?? appAño,
    selectedRegimenFiscal: init.initialRegimenFiscal ?? 'all',
    isInitialLoad: true,
    invoiceToDelete: null,
    deleteError: null,
    deleteConfirmation: '',
    isDeleting: false,
    addManualIncomeOpen: false,
    manualIncomeConcept: '',
    manualIncomeSubtotal: '',
    manualIncomeIva: '',
    manualIncomeFecha: '',
    manualIncomeNotes: '',
    manualIncomeFormError: null,
    editingManualIncome: null,
    manualIncomeIsPaid: false,
    manualIncomePaymentDate: '',
    manualIncomeToDelete: null,
    manualIncomeDeleteConfirmation: '',
    manualIncomeDeleteError: null,
    isDeletingManualIncome: false,
  };
}

export type InvoicesListUiAction =
  | { type: 'patch'; patch: Partial<InvoicesListUiState> }
  | { type: 'sync_from_url'; profileId: string; mes: number; año: number; regimen: string; search: string }
  | { type: 'clear_filters'; mes: number; año: number }
  | { type: 'profile_change'; profileId: string }
  | { type: 'set_initial_load_done' }
  | { type: 'open_delete_invoice'; invoice: Invoice }
  | { type: 'close_delete_invoice' }
  | { type: 'open_edit_manual_income'; income: ManualIncome }
  | { type: 'close_edit_manual_income' }
  | { type: 'reset_manual_income_form' };

export function invoicesListUiReducer(
  state: InvoicesListUiState,
  action: InvoicesListUiAction
): InvoicesListUiState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch };
    case 'sync_from_url':
      return {
        ...state,
        selectedProfileId: action.profileId,
        selectedMes: action.mes,
        selectedAño: action.año,
        selectedRegimenFiscal: action.regimen,
        search: action.search,
      };
    case 'clear_filters':
      return {
        ...state,
        search: '',
        selectedMes: action.mes,
        selectedAño: action.año,
        selectedRegimenFiscal: 'all',
      };
    case 'profile_change':
      return { ...state, selectedProfileId: action.profileId, selectedRegimenFiscal: 'all' };
    case 'set_initial_load_done':
      return { ...state, isInitialLoad: false };
    case 'open_delete_invoice':
      return {
        ...state,
        invoiceToDelete: action.invoice,
        deleteError: null,
        deleteConfirmation: '',
      };
    case 'close_delete_invoice':
      return {
        ...state,
        invoiceToDelete: null,
        deleteError: null,
        deleteConfirmation: '',
      };
    case 'open_edit_manual_income':
      return {
        ...state,
        editingManualIncome: action.income,
        manualIncomeConcept: action.income.concept,
        manualIncomeSubtotal: String(action.income.subtotal),
        manualIncomeIva: String(action.income.iva_amount ?? 0),
        manualIncomeFecha: action.income.fecha,
        manualIncomeNotes: action.income.notes ?? '',
        manualIncomeIsPaid: action.income.is_paid,
        manualIncomePaymentDate: action.income.payment_date ?? '',
        manualIncomeFormError: null,
      };
    case 'close_edit_manual_income':
      return state.isDeletingManualIncome
        ? state
        : { ...state, editingManualIncome: null, manualIncomeFormError: null };
    case 'reset_manual_income_form':
      return {
        ...state,
        manualIncomeConcept: '',
        manualIncomeSubtotal: '',
        manualIncomeIva: '',
        manualIncomeFecha: '',
        manualIncomeNotes: '',
        manualIncomeFormError: null,
        manualIncomeIsPaid: false,
        manualIncomePaymentDate: '',
      };
    default:
      return state;
  }
}
