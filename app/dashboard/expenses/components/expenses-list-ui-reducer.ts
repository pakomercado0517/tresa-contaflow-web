import type { Expense } from '@/lib/types/expenses';
import type { ManualEntryIvaRateOption } from '@/lib/utils/manual-entry-iva';
import {
  inferIvaRateOption,
  resolveManualEntryIvaAmount,
} from '@/lib/utils/manual-entry-iva';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

export interface ExpensesListUiState {
  search: string;
  selectedProfileId: string;
  selectedMes: number;
  selectedAño: number;
  selectedRegimenFiscal: string;
  isManualExpenseDialogOpen: boolean;
  showProfileWarning: boolean;
  isInitialLoad: boolean;
  expenseToDelete: Expense | null;
  deleteError: string | null;
  deleteConfirmation: string;
  isDeleting: boolean;
  editingManualExpense: Expense | null;
  editConcept: string;
  editSubtotal: string;
  editIvaAmount: string;
  editIvaRateOption: ManualEntryIvaRateOption;
  editIsPaid: boolean;
  editPaymentDate: string;
  editCategoria: string;
  editError: string | null;
  isUpdatingManual: boolean;
}

export interface ExpensesListUiInit {
  initialSearch?: string;
  initialProfileId?: string;
  initialMes?: number;
  initialAño?: number;
  initialRegimenFiscal?: string;
}

export function createInitialExpensesListUiState(init: ExpensesListUiInit): ExpensesListUiState {
  const { mes: appMes, año: appAño } = getCurrentMonthYearInAppTimezone();
  return {
    search: init.initialSearch ?? '',
    selectedProfileId: init.initialProfileId ?? 'all',
    selectedMes: init.initialMes ?? appMes,
    selectedAño: init.initialAño ?? appAño,
    selectedRegimenFiscal: init.initialRegimenFiscal ?? 'all',
    isManualExpenseDialogOpen: false,
    showProfileWarning: false,
    isInitialLoad: true,
    expenseToDelete: null,
    deleteError: null,
    deleteConfirmation: '',
    isDeleting: false,
    editingManualExpense: null,
    editConcept: '',
    editSubtotal: '',
    editIvaAmount: '',
    editIvaRateOption: '16',
    editIsPaid: false,
    editPaymentDate: '',
    editCategoria: '',
    editError: null,
    isUpdatingManual: false,
  };
}

export type ExpensesListUiAction =
  | { type: 'set_search'; value: string }
  | { type: 'set_selected_profile_id'; value: string }
  | { type: 'set_selected_mes'; value: number }
  | { type: 'set_selected_año'; value: number }
  | { type: 'set_selected_regimen_fiscal'; value: string }
  | {
      type: 'sync_from_url';
      profileId: string;
      mes: number;
      año: number;
      regimen: string;
      search: string;
    }
  | { type: 'clear_filters'; mes: number; año: number }
  | { type: 'profile_change'; profileId: string; regimenFiscal: string }
  | { type: 'set_manual_expense_dialog_open'; open: boolean }
  | { type: 'set_show_profile_warning'; value: boolean }
  | { type: 'set_initial_load_done' }
  | { type: 'open_delete'; expense: Expense }
  | { type: 'close_delete' }
  | { type: 'set_delete_confirmation'; value: string }
  | { type: 'set_delete_error'; message: string | null }
  | { type: 'delete_start' }
  | { type: 'delete_success' }
  | { type: 'delete_error'; message: string }
  | { type: 'delete_end' }
  | { type: 'open_edit_manual'; expense: Expense }
  | { type: 'close_edit_manual' }
  | { type: 'set_edit_concept'; value: string }
  | { type: 'set_edit_subtotal'; value: string; ivaAmount?: string }
  | { type: 'set_edit_iva_amount'; value: string }
  | { type: 'set_edit_iva_rate_option'; value: ManualEntryIvaRateOption; ivaAmount?: string }
  | { type: 'set_edit_is_paid'; value: boolean }
  | { type: 'set_edit_payment_date'; value: string }
  | { type: 'set_edit_categoria'; value: string }
  | { type: 'set_edit_error'; message: string | null }
  | { type: 'edit_submit_start' }
  | { type: 'edit_submit_success' }
  | { type: 'edit_submit_end' };

export function expensesListUiReducer(
  state: ExpensesListUiState,
  action: ExpensesListUiAction
): ExpensesListUiState {
  switch (action.type) {
    case 'set_search':
      return { ...state, search: action.value };
    case 'set_selected_profile_id':
      return { ...state, selectedProfileId: action.value };
    case 'set_selected_mes':
      return { ...state, selectedMes: action.value };
    case 'set_selected_año':
      return { ...state, selectedAño: action.value };
    case 'set_selected_regimen_fiscal':
      return { ...state, selectedRegimenFiscal: action.value };
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
      return {
        ...state,
        selectedProfileId: action.profileId,
        selectedRegimenFiscal: action.regimenFiscal,
      };
    case 'set_manual_expense_dialog_open':
      return { ...state, isManualExpenseDialogOpen: action.open };
    case 'set_show_profile_warning':
      return { ...state, showProfileWarning: action.value };
    case 'set_initial_load_done':
      return { ...state, isInitialLoad: false };
    case 'open_delete':
      return {
        ...state,
        expenseToDelete: action.expense,
        deleteError: null,
        deleteConfirmation: '',
      };
    case 'close_delete':
      return {
        ...state,
        expenseToDelete: null,
        deleteError: null,
        deleteConfirmation: '',
      };
    case 'set_delete_confirmation':
      return { ...state, deleteConfirmation: action.value };
    case 'set_delete_error':
      return { ...state, deleteError: action.message };
    case 'delete_start':
      return { ...state, isDeleting: true, deleteError: null };
    case 'delete_success':
      return { ...state, expenseToDelete: null, isDeleting: false };
    case 'delete_error':
      return { ...state, deleteError: action.message, isDeleting: false };
    case 'delete_end':
      return { ...state, isDeleting: false };
    case 'open_edit_manual': {
      const ivaAmount = resolveManualEntryIvaAmount(action.expense);
      return {
        ...state,
        editingManualExpense: action.expense,
        editConcept: action.expense.concepto ?? '',
        editSubtotal: action.expense.subtotal.toString(),
        editIvaAmount: String(ivaAmount),
        editIvaRateOption: inferIvaRateOption(action.expense.iva),
        editIsPaid: action.expense.is_paid ?? false,
        editPaymentDate: action.expense.payment_date ?? '',
        editCategoria: action.expense.categoria ?? '',
        editError: null,
      };
    }
    case 'close_edit_manual':
      return state.isUpdatingManual
        ? state
        : { ...state, editingManualExpense: null, editError: null };
    case 'set_edit_concept':
      return { ...state, editConcept: action.value };
    case 'set_edit_subtotal':
      return {
        ...state,
        editSubtotal: action.value,
        ...(action.ivaAmount !== undefined ? { editIvaAmount: action.ivaAmount } : {}),
      };
    case 'set_edit_iva_amount':
      return { ...state, editIvaAmount: action.value };
    case 'set_edit_iva_rate_option':
      return {
        ...state,
        editIvaRateOption: action.value,
        ...(action.ivaAmount !== undefined ? { editIvaAmount: action.ivaAmount } : {}),
      };
    case 'set_edit_is_paid':
      return { ...state, editIsPaid: action.value };
    case 'set_edit_payment_date':
      return { ...state, editPaymentDate: action.value };
    case 'set_edit_categoria':
      return { ...state, editCategoria: action.value };
    case 'set_edit_error':
      return { ...state, editError: action.message };
    case 'edit_submit_start':
      return { ...state, isUpdatingManual: true, editError: null };
    case 'edit_submit_success':
      return { ...state, editingManualExpense: null, isUpdatingManual: false };
    case 'edit_submit_end':
      return { ...state, isUpdatingManual: false };
    default:
      return state;
  }
}
