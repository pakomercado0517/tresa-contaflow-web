'use client';

import { useRef, useEffect, useCallback, useMemo, useEffectEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useExpensesListUiState } from './use-expenses-list-ui-state';
import { exportToPDF, normalizeExpensesForExport } from '@/lib/utils/pdf-export';
import { exportToExcel } from '@/lib/excel';
import { hasFeatureAccess } from '@/lib/hooks/useSubscription';
import { deleteExpense } from '@/lib/api/expenses.client';
import { getRegimenesFiscalesClient } from '@/lib/api/sat.client';
import {
  deleteAccruedExpenseClient,
  updateAccruedExpenseClient,
} from '@/lib/api/accrued-expenses.client';
import { ApiError } from '@/lib/api/client';
import { setStoredDashboardFilters } from '@/lib/storage/dashboard-filters';
import { useDashboardFiltersUrlRestoreRef } from '@/lib/navigation/use-dashboard-filters-url-restore-ref';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';
import type { Expense } from '@/lib/types/expenses';
import type { Profile } from '@/lib/types/profiles';
import type { Subscription } from '@/lib/types/subscription';
import type {
  PaymentComplementListItem,
  PaymentComplementsPagination,
} from '@/lib/types/payment-complements';
import { getExpenseDeleteErrorMessage } from './expenses-list-display-utils';

export interface ExpensesListViewModelInput {
  expenses: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  profiles: Profile[];
  manualExpenses: Expense[];
  manualExpensesState: 'idle' | 'loading' | 'updating' | 'disabled';
  manualExpenseDisabledReason: 'no_profile' | 'no_period' | null;
  periodId: string | null;
  profileId: string | undefined;
  subscription?: Subscription | null;
  expensesUsed?: number;
  initialProfileId?: string;
  initialMes?: number;
  initialAño?: number;
  initialRegimenFiscal?: string;
  initialSearch?: string;
  tableState?: 'idle' | 'loading' | 'updating';
  paymentComplements: PaymentComplementListItem[];
  paymentComplementsPagination: PaymentComplementsPagination;
  paymentComplementsState: 'idle' | 'loading' | 'updating' | 'error';
  paymentComplementsError?: string;
  complementPage: number;
}

export function useExpensesListViewModel({
  expenses,
  pagination,
  profiles,
  manualExpenses: manualExpensesFromPeriod,
  manualExpensesState,
  manualExpenseDisabledReason,
  periodId,
  profileId,
  subscription,
  expensesUsed = 0,
  initialProfileId,
  initialMes,
  initialAño,
  initialRegimenFiscal,
  initialSearch,
  tableState = 'idle',
  paymentComplements,
  paymentComplementsPagination,
  paymentComplementsState,
  paymentComplementsError,
  complementPage,
}: ExpensesListViewModelInput) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isSyncingFromUrlRef = useRef(false);
  const {
    dispatchUi,
    search,
    setSearch,
    selectedProfileId,
    selectedMes,
    setSelectedMes,
    selectedAño,
    setSelectedAño,
    selectedRegimenFiscal,
    setSelectedRegimenFiscal,
    isManualExpenseDialogOpen,
    setIsManualExpenseDialogOpen,
    showProfileWarning,
    setShowProfileWarning,
    isInitialLoad,
    expenseToDelete,
    deleteError,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleting,
    editingManualExpense,
    editConcept,
    setEditConcept,
    editSubtotal,
    setEditSubtotal,
    editIva,
    setEditIva,
    editIsPaid,
    setEditIsPaid,
    editPaymentDate,
    setEditPaymentDate,
    editCategoria,
    setEditCategoria,
    editError,
    isUpdatingManual,
  } = useExpensesListUiState({
    initialSearch,
    initialProfileId,
    initialMes,
    initialAño,
    initialRegimenFiscal,
  });

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const { data: regimenesCatalogData } = useQuery({
    queryKey: ['regimenes-fiscales'],
    queryFn: () => getRegimenesFiscalesClient(),
    enabled: !!selectedProfile?.regimenes_fiscales?.length,
    staleTime: 5 * 60 * 1000,
  });

  const regimenOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'Todos los regímenes' }];
    const profileRegimenes = selectedProfile?.regimenes_fiscales ?? [];
    if (profileRegimenes.length === 0) return options;

    const catalog = regimenesCatalogData?.data ?? [];
    const descripcionMap = Object.fromEntries(catalog.map((r) => [r.clave, r.descripcion]));

    for (const clave of profileRegimenes) {
      const desc = descripcionMap[clave];
      options.push({
        value: clave,
        label: desc ? `${clave} - ${desc}` : clave,
      });
    }
    return options;
  }, [selectedProfile?.regimenes_fiscales, regimenesCatalogData?.data]);

  const exportPdfHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('mes', String(selectedMes));
    params.set('año', String(selectedAño));
    if (selectedProfileId && selectedProfileId !== 'all')
      params.set('profileId', selectedProfileId);
    if (selectedRegimenFiscal && selectedRegimenFiscal !== 'all')
      params.set('regimen_fiscal', selectedRegimenFiscal);
    if (search?.trim()) params.set('search', search.trim());
    return `/dashboard/expenses/reporte/preview?${params.toString()}`;
  }, [selectedMes, selectedAño, selectedProfileId, selectedRegimenFiscal, search]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedProfileId && selectedProfileId !== 'all')
      params.set('profileId', selectedProfileId);
    if (selectedMes) params.set('mes', selectedMes.toString());
    if (selectedAño) params.set('año', selectedAño.toString());
    if (
      selectedProfileId &&
      selectedProfileId !== 'all' &&
      selectedRegimenFiscal &&
      selectedRegimenFiscal !== 'all'
    )
      params.set('regimen_fiscal', selectedRegimenFiscal);
    if (search) params.set('search', search);
    params.set('page', '1');
    params.set('complementPage', '1');
    setStoredDashboardFilters({
      profileId: selectedProfileId || 'all',
      mes: selectedMes,
      año: selectedAño,
    });
    router.push(`/dashboard/expenses?${params.toString()}`);
  }, [selectedProfileId, selectedMes, selectedAño, selectedRegimenFiscal, search, router]);

  const runApplyFilters = useEffectEvent(() => {
    applyFilters();
  });

  const dashboardFiltersUrlRestoreRef = useDashboardFiltersUrlRestoreRef(
    '/dashboard/expenses',
    profiles
  );

  useEffect(() => {
    const { mes: appMes, año: appAño } = getCurrentMonthYearInAppTimezone();
    const urlProfileId = searchParams.get('profileId') ?? 'all';
    const urlMes = Number(searchParams.get('mes') ?? String(appMes));
    const urlAño = Number(searchParams.get('año') ?? String(appAño));
    const urlRegimen = searchParams.get('regimen_fiscal') ?? 'all';
    const urlSearch = searchParams.get('search') ?? '';

    isSyncingFromUrlRef.current = true;
    dispatchUi({
      type: 'sync_from_url',
      profileId: urlProfileId,
      mes: urlMes,
      año: urlAño,
      regimen: urlRegimen,
      search: urlSearch,
    });

    const timeout = window.setTimeout(() => {
      isSyncingFromUrlRef.current = false;
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [searchParams, dispatchUi]);

  useEffect(() => {
    if (isInitialLoad) return;
    if (isSyncingFromUrlRef.current) return;
    applyFilters();
  }, [isInitialLoad, selectedMes, selectedAño, selectedRegimenFiscal, applyFilters]);

  useEffect(() => {
    dispatchUi({ type: 'set_initial_load_done' });
  }, [dispatchUi]);

  useEffect(() => {
    if (isInitialLoad) return;
    if (isSyncingFromUrlRef.current) return;

    const timer = setTimeout(() => {
      runApplyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, isInitialLoad]);

  const handleClearFilters = () => {
    const { mes: appMes, año: appAño } = getCurrentMonthYearInAppTimezone();
    dispatchUi({ type: 'clear_filters', mes: appMes, año: appAño });
    const params = new URLSearchParams();
    if (selectedProfileId && selectedProfileId !== 'all')
      params.set('profileId', selectedProfileId);
    params.set('mes', String(appMes));
    params.set('año', String(appAño));
    params.set('page', '1');
    params.set('complementPage', '1');
    setStoredDashboardFilters({
      mes: appMes,
      año: appAño,
      profileId: selectedProfileId || 'all',
    });
    router.push(`/dashboard/expenses?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/expenses?${params.toString()}`);
  };

  const handleComplementPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('complementPage', newPage.toString());
    router.push(`/dashboard/expenses?${params.toString()}`);
  };

  const showComplementProfileColumn = !profileId;
  const canExportPDF = hasFeatureAccess(subscription ?? null, 'pdf_export');
  const canExportExcel = hasFeatureAccess(subscription ?? null, 'excel_export');

  const handleExportPDF = async () => {
    const profileForExport = profiles.find((p) => p.id === selectedProfileId);
    const normalizedExpenses = normalizeExpensesForExport(expenses);
    const totalGastos = normalizedExpenses.reduce((sum, exp) => sum + exp.total, 0);

    await exportToPDF({
      tipo: 'gastos',
      expenses: normalizedExpenses,
      profileName: profileForExport?.nombre || 'Todos los perfiles',
      rfc: profileForExport?.rfc || '',
      mes: selectedMes,
      año: selectedAño,
      metrics: {
        totalFacturado: 0,
        totalPagado: 0,
        totalCompras: totalGastos,
        pendientePorPagar: 0,
        diferencia: 0,
      },
    });
  };

  const handleExportExcel = async () => {
    const profileForExport = profiles.find((p) => p.id === selectedProfileId);
    const normalizedExpenses = normalizeExpensesForExport(expenses);
    const totalGastos = normalizedExpenses.reduce((sum, exp) => sum + exp.total, 0);

    await exportToExcel({
      tipo: 'gastos',
      expenses: normalizedExpenses,
      profileName: profileForExport?.nombre || 'Todos los perfiles',
      rfc: profileForExport?.rfc || '',
      mes: selectedMes,
      año: selectedAño,
      metrics: {
        totalFacturado: 0,
        totalPagado: 0,
        totalCompras: totalGastos,
        pendientePorPagar: 0,
        diferencia: 0,
      },
    });
  };

  const handleProfileChange = (nextProfileId: string) => {
    dispatchUi({ type: 'profile_change', profileId: nextProfileId });
    setStoredDashboardFilters({ profileId: nextProfileId || 'all' });
    const params = new URLSearchParams(searchParams.toString());
    if (nextProfileId && nextProfileId !== 'all') {
      params.set('profileId', nextProfileId);
    } else {
      params.delete('profileId');
    }
    params.delete('regimen_fiscal');
    params.set('page', '1');
    params.set('complementPage', '1');
    router.push(`/dashboard/expenses?${params.toString()}`);
  };

  const handleDeleteClick = (expense: Expense) => {
    dispatchUi({ type: 'open_delete', expense });
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open && !isDeleting) {
      dispatchUi({ type: 'close_delete' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    dispatchUi({ type: 'delete_start' });

    try {
      if (expenseToDelete.tipo_origen === 'MANUAL') {
        await deleteAccruedExpenseClient(expenseToDelete.id);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['accrued-expenses'] }),
          queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] }),
          queryClient.invalidateQueries({ queryKey: ['expenses'] }),
        ]);
      } else {
        await deleteExpense(expenseToDelete.id);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['expenses'] }),
          queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] }),
        ]);
      }
      dispatchUi({ type: 'delete_success' });
    } catch (error) {
      dispatchUi({ type: 'delete_error', message: getExpenseDeleteErrorMessage(error) });
    }
  };

  const handleOpenEditManual = (expense: Expense) => {
    dispatchUi({ type: 'open_edit_manual', expense });
  };

  const handleCloseEditManual = () => {
    dispatchUi({ type: 'close_edit_manual' });
  };

  const handleSubmitEditManual = async () => {
    if (!editingManualExpense) return;
    dispatchUi({ type: 'set_edit_error', message: null });
    const concept = editConcept.trim();
    const subtotalNum = Number(editSubtotal.replace(/,/g, '.'));
    const ivaNum = Number(editIva.replace(/,/g, '.')) || 0;
    if (!concept) {
      dispatchUi({ type: 'set_edit_error', message: 'El concepto es obligatorio.' });
      return;
    }
    if (!Number.isFinite(subtotalNum) || subtotalNum < 0) {
      dispatchUi({ type: 'set_edit_error', message: 'El subtotal debe ser un número ≥ 0.' });
      return;
    }
    if (!Number.isFinite(ivaNum) || ivaNum < 0) {
      dispatchUi({ type: 'set_edit_error', message: 'El IVA debe ser un número ≥ 0.' });
      return;
    }
    dispatchUi({ type: 'edit_submit_start' });
    try {
      await updateAccruedExpenseClient(editingManualExpense.id, {
        concept,
        subtotal: subtotalNum,
        iva_amount: ivaNum,
        is_paid: editIsPaid,
        payment_date: editIsPaid ? editPaymentDate || null : null,
        categoria: editCategoria || null,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['accrued-expenses'] }),
        queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
      ]);
      dispatchUi({ type: 'edit_submit_success' });
    } catch (err) {
      dispatchUi({
        type: 'set_edit_error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar el gasto.',
      });
      dispatchUi({ type: 'edit_submit_end' });
    }
  };

  const xmlExpenses = expenses.filter((e) => e.tipo_origen === 'XML');
  const manualExpensesForSection =
    periodId != null ? manualExpensesFromPeriod : expenses.filter((e) => e.tipo_origen === 'MANUAL');
  const validXmlExpenses = xmlExpenses.filter((e) => e.validacion?.valido);
  const canAddManualExpense = !!profileId && !!periodId;

  const totalExpensesAmount = expenses.reduce((sum, expense) => {
    const total =
      typeof expense.total === 'number' ? expense.total : parseFloat(String(expense.total)) || 0;
    return sum + total;
  }, 0);

  const invalidateAfterManualExpense = () => {
    queryClient.invalidateQueries({ queryKey: ['accrued-expenses'] });
    queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  return {
    dashboardFiltersUrlRestoreRef,
    pagination,
    tableState,
    paymentComplements,
    paymentComplementsPagination,
    paymentComplementsState,
    paymentComplementsError,
    complementPage,
    selectedMes,
    selectedAño,
    showComplementProfileColumn,
    profiles,
    selectedProfileId,
    selectedRegimenFiscal,
    regimenOptions,
    selectedProfile,
    search,
    setSearch,
    setSelectedMes,
    setSelectedAño,
    setSelectedRegimenFiscal,
    exportPdfHref,
    canExportPDF,
    canExportExcel,
    handleProfileChange,
    handleClearFilters,
    handleExportPDF,
    handleExportExcel,
    setIsManualExpenseDialogOpen,
    canAddManualExpense,
    manualExpenseDisabledReason,
    totalExpensesAmount,
    xmlExpenses,
    validXmlExpenses,
    manualExpensesForSection,
    manualExpensesState,
    handleOpenEditManual,
    handleDeleteClick,
    handlePageChange,
    handleComplementPageChange,
    periodId,
    subscription,
    expensesUsed,
    isManualExpenseDialogOpen,
    invalidateAfterManualExpense,
    editingManualExpense,
    editConcept,
    setEditConcept,
    editSubtotal,
    setEditSubtotal,
    editIva,
    setEditIva,
    editIsPaid,
    setEditIsPaid,
    editPaymentDate,
    setEditPaymentDate,
    editCategoria,
    setEditCategoria,
    editError,
    isUpdatingManual,
    handleCloseEditManual,
    handleSubmitEditManual,
    showProfileWarning,
    setShowProfileWarning,
    expenseToDelete,
    deleteConfirmation,
    setDeleteConfirmation,
    deleteError,
    isDeleting,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    expenses,
  };
}
