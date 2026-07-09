'use client';

import { useCallback, useReducer } from 'react';
import type { Expense } from '@/lib/types/expenses';
import {
  createInitialExpensesListUiState,
  expensesListUiReducer,
  type ExpensesListUiInit,
} from './expenses-list-ui-reducer';

export function useExpensesListUiState(init: ExpensesListUiInit) {
  const [state, dispatch] = useReducer(expensesListUiReducer, init, createInitialExpensesListUiState);

  const setSearch = useCallback((value: string) => {
    dispatch({ type: 'set_search', value });
  }, []);

  const setSelectedProfileId = useCallback((value: string) => {
    dispatch({ type: 'set_selected_profile_id', value });
  }, []);

  const setSelectedMes = useCallback((value: number) => {
    dispatch({ type: 'set_selected_mes', value });
  }, []);

  const setSelectedAño = useCallback((value: number) => {
    dispatch({ type: 'set_selected_año', value });
  }, []);

  const setSelectedRegimenFiscal = useCallback((value: string) => {
    dispatch({ type: 'set_selected_regimen_fiscal', value });
  }, []);

  const setIsManualExpenseDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: 'set_manual_expense_dialog_open', open });
  }, []);

  const setShowProfileWarning = useCallback((value: boolean) => {
    dispatch({ type: 'set_show_profile_warning', value });
  }, []);

  const setIsInitialLoad = useCallback((value: boolean) => {
    if (!value) dispatch({ type: 'set_initial_load_done' });
  }, []);

  const setExpenseToDelete = useCallback((expense: Expense | null) => {
    if (expense) dispatch({ type: 'open_delete', expense });
    else dispatch({ type: 'close_delete' });
  }, []);

  const setDeleteError = useCallback((message: string | null) => {
    dispatch({ type: 'set_delete_error', message });
  }, []);

  const setDeleteConfirmation = useCallback((value: string) => {
    dispatch({ type: 'set_delete_confirmation', value });
  }, []);

  const setIsDeleting = useCallback((value: boolean) => {
    if (value) dispatch({ type: 'delete_start' });
    else dispatch({ type: 'delete_end' });
  }, []);

  const setEditingManualExpense = useCallback((expense: Expense | null) => {
    if (expense) dispatch({ type: 'open_edit_manual', expense });
    else dispatch({ type: 'close_edit_manual' });
  }, []);

  const setEditConcept = useCallback((value: string) => {
    dispatch({ type: 'set_edit_concept', value });
  }, []);

  const setEditSubtotal = useCallback((value: string) => {
    dispatch({ type: 'set_edit_subtotal', value });
  }, []);

  const setEditIva = useCallback((value: string) => {
    dispatch({ type: 'set_edit_iva', value });
  }, []);

  const setEditIsPaid = useCallback((value: boolean) => {
    dispatch({ type: 'set_edit_is_paid', value });
  }, []);

  const setEditPaymentDate = useCallback((value: string) => {
    dispatch({ type: 'set_edit_payment_date', value });
  }, []);

  const setEditCategoria = useCallback((value: string) => {
    dispatch({ type: 'set_edit_categoria', value });
  }, []);

  const setEditError = useCallback((message: string | null) => {
    dispatch({ type: 'set_edit_error', message });
  }, []);

  const setIsUpdatingManual = useCallback((value: boolean) => {
    if (value) dispatch({ type: 'edit_submit_start' });
    else dispatch({ type: 'edit_submit_end' });
  }, []);

  return {
    dispatchUi: dispatch,
    search: state.search,
    setSearch,
    selectedProfileId: state.selectedProfileId,
    setSelectedProfileId,
    selectedMes: state.selectedMes,
    setSelectedMes,
    selectedAño: state.selectedAño,
    setSelectedAño,
    selectedRegimenFiscal: state.selectedRegimenFiscal,
    setSelectedRegimenFiscal,
    isManualExpenseDialogOpen: state.isManualExpenseDialogOpen,
    setIsManualExpenseDialogOpen,
    showProfileWarning: state.showProfileWarning,
    setShowProfileWarning,
    isInitialLoad: state.isInitialLoad,
    setIsInitialLoad,
    expenseToDelete: state.expenseToDelete,
    setExpenseToDelete,
    deleteError: state.deleteError,
    setDeleteError,
    deleteConfirmation: state.deleteConfirmation,
    setDeleteConfirmation,
    isDeleting: state.isDeleting,
    setIsDeleting,
    editingManualExpense: state.editingManualExpense,
    setEditingManualExpense,
    editConcept: state.editConcept,
    setEditConcept,
    editSubtotal: state.editSubtotal,
    setEditSubtotal,
    editIva: state.editIva,
    setEditIva,
    editIsPaid: state.editIsPaid,
    setEditIsPaid,
    editPaymentDate: state.editPaymentDate,
    setEditPaymentDate,
    editCategoria: state.editCategoria,
    setEditCategoria,
    editError: state.editError,
    setEditError,
    isUpdatingManual: state.isUpdatingManual,
    setIsUpdatingManual,
  };
}
