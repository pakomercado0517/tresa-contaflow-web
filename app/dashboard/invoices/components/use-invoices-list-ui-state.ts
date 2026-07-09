'use client';

import { useCallback, useReducer } from 'react';
import {
  createInitialInvoicesListUiState,
  invoicesListUiReducer,
  type InvoicesListUiInit,
  type InvoicesListUiState,
} from './invoices-list-ui-reducer';

export function useInvoicesListUiState(init: InvoicesListUiInit) {
  const [state, dispatch] = useReducer(invoicesListUiReducer, init, createInitialInvoicesListUiState);

  const patchUi = useCallback((patch: Partial<InvoicesListUiState>) => {
    dispatch({ type: 'patch', patch });
  }, []);

  const setSearch = useCallback((value: string) => patchUi({ search: value }), [patchUi]);
  const setSelectedProfileId = useCallback(
    (value: string) => patchUi({ selectedProfileId: value }),
    [patchUi]
  );
  const setSelectedMes = useCallback((value: number) => patchUi({ selectedMes: value }), [patchUi]);
  const setSelectedAño = useCallback((value: number) => patchUi({ selectedAño: value }), [patchUi]);
  const setSelectedRegimenFiscal = useCallback(
    (value: string) => patchUi({ selectedRegimenFiscal: value }),
    [patchUi]
  );
  const setIsInitialLoad = useCallback(
    (value: boolean) => {
      if (!value) dispatch({ type: 'set_initial_load_done' });
    },
    []
  );
  const setInvoiceToDelete = useCallback(
    (invoice: import('@/lib/types/invoices').Invoice | null) => {
      if (invoice) dispatch({ type: 'open_delete_invoice', invoice });
      else dispatch({ type: 'close_delete_invoice' });
    },
    []
  );
  const setDeleteError = useCallback(
    (message: string | null) => patchUi({ deleteError: message }),
    [patchUi]
  );
  const setDeleteConfirmation = useCallback(
    (value: string) => patchUi({ deleteConfirmation: value }),
    [patchUi]
  );
  const setIsDeleting = useCallback(
    (value: boolean) => patchUi({ isDeleting: value }),
    [patchUi]
  );
  const setAddManualIncomeOpen = useCallback(
    (open: boolean) => patchUi({ addManualIncomeOpen: open }),
    [patchUi]
  );
  const setManualIncomeConcept = useCallback(
    (value: string) => patchUi({ manualIncomeConcept: value }),
    [patchUi]
  );
  const setManualIncomeSubtotal = useCallback(
    (value: string) => patchUi({ manualIncomeSubtotal: value }),
    [patchUi]
  );
  const setManualIncomeIva = useCallback(
    (value: string) => patchUi({ manualIncomeIva: value }),
    [patchUi]
  );
  const setManualIncomeFecha = useCallback(
    (value: string) => patchUi({ manualIncomeFecha: value }),
    [patchUi]
  );
  const setManualIncomeNotes = useCallback(
    (value: string) => patchUi({ manualIncomeNotes: value }),
    [patchUi]
  );
  const setManualIncomeFormError = useCallback(
    (message: string | null) => patchUi({ manualIncomeFormError: message }),
    [patchUi]
  );
  const setEditingManualIncome = useCallback(
    (income: import('@/lib/types/manual-incomes').ManualIncome | null) => {
      if (income) dispatch({ type: 'open_edit_manual_income', income });
      else dispatch({ type: 'close_edit_manual_income' });
    },
    []
  );
  const setManualIncomeIsPaid = useCallback(
    (value: boolean) => patchUi({ manualIncomeIsPaid: value }),
    [patchUi]
  );
  const setManualIncomePaymentDate = useCallback(
    (value: string) => patchUi({ manualIncomePaymentDate: value }),
    [patchUi]
  );
  const setManualIncomeToDelete = useCallback(
    (income: import('@/lib/types/manual-incomes').ManualIncome | null) =>
      patchUi({ manualIncomeToDelete: income }),
    [patchUi]
  );
  const setManualIncomeDeleteConfirmation = useCallback(
    (value: string) => patchUi({ manualIncomeDeleteConfirmation: value }),
    [patchUi]
  );
  const setManualIncomeDeleteError = useCallback(
    (message: string | null) => patchUi({ manualIncomeDeleteError: message }),
    [patchUi]
  );
  const setIsDeletingManualIncome = useCallback(
    (value: boolean) => patchUi({ isDeletingManualIncome: value }),
    [patchUi]
  );

  return {
    dispatchUi: dispatch,
    patchUi,
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
    isInitialLoad: state.isInitialLoad,
    setIsInitialLoad,
    invoiceToDelete: state.invoiceToDelete,
    setInvoiceToDelete,
    deleteError: state.deleteError,
    setDeleteError,
    deleteConfirmation: state.deleteConfirmation,
    setDeleteConfirmation,
    isDeleting: state.isDeleting,
    setIsDeleting,
    addManualIncomeOpen: state.addManualIncomeOpen,
    setAddManualIncomeOpen,
    manualIncomeConcept: state.manualIncomeConcept,
    setManualIncomeConcept,
    manualIncomeSubtotal: state.manualIncomeSubtotal,
    setManualIncomeSubtotal,
    manualIncomeIva: state.manualIncomeIva,
    setManualIncomeIva,
    manualIncomeFecha: state.manualIncomeFecha,
    setManualIncomeFecha,
    manualIncomeNotes: state.manualIncomeNotes,
    setManualIncomeNotes,
    manualIncomeFormError: state.manualIncomeFormError,
    setManualIncomeFormError,
    editingManualIncome: state.editingManualIncome,
    setEditingManualIncome,
    manualIncomeIsPaid: state.manualIncomeIsPaid,
    setManualIncomeIsPaid,
    manualIncomePaymentDate: state.manualIncomePaymentDate,
    setManualIncomePaymentDate,
    manualIncomeToDelete: state.manualIncomeToDelete,
    setManualIncomeToDelete,
    manualIncomeDeleteConfirmation: state.manualIncomeDeleteConfirmation,
    setManualIncomeDeleteConfirmation,
    manualIncomeDeleteError: state.manualIncomeDeleteError,
    setManualIncomeDeleteError,
    isDeletingManualIncome: state.isDeletingManualIncome,
    setIsDeletingManualIncome,
  };
}
