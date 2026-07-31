'use client';

import { useRef, useEffect, useCallback, useMemo, useEffectEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInvoicesListUiState } from './use-invoices-list-ui-state';
import { useSubscription, hasFeatureAccess } from '@/lib/hooks/useSubscription';
import { exportToPDF, normalizeInvoicesForExport } from '@/lib/utils/pdf-export';
import { exportToExcel } from '@/lib/excel';
import { deleteInvoice } from '@/lib/api/invoices.client';
import {
  createManualIncomeClient,
  updateManualIncomeClient,
  deleteManualIncomeClient,
} from '@/lib/api/manual-incomes.client';
import { getRegimenesFiscalesClient } from '@/lib/api/sat.client';
import { ApiError } from '@/lib/api/client';
import { setStoredDashboardFilters } from '@/lib/storage/dashboard-filters';
import {
  buildListFiltersSearchParams,
  getDefaultRegimenFiscalForProfile,
  listFiltersQueryMatchesUrl,
} from '@/lib/navigation/resolve-dashboard-list-filters';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';
import type { Invoice } from '@/lib/types/invoices';
import type { Profile } from '@/lib/types/profiles';
import type { ManualIncome } from '@/lib/types/manual-incomes';
import type {
  PaymentComplementListItem,
  PaymentComplementsPagination,
} from '@/lib/types/payment-complements';
import {
  getInvoiceDeleteErrorMessage,
  getManualIncomeDeleteErrorMessage,
} from './invoices-list-display-utils';

export interface InvoicesListViewModelInput {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  profiles: Profile[];
  manualIncomes: ManualIncome[];
  manualIncomesState: 'idle' | 'loading' | 'updating' | 'disabled';
  manualIncomeDisabledReason: 'no_profile' | 'no_period' | null;
  periodId: string | null;
  profileId: string | undefined;
  metrics: {
    totalFacturado: number;
    totalFacturas: number;
    facturasPendientesPago: number;
    facturasPUE: number;
    facturasPPD: number;
  };
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

export function useInvoicesListViewModel({
  invoices,
  pagination,
  profiles,
  manualIncomes,
  manualIncomesState,
  manualIncomeDisabledReason,
  periodId,
  profileId,
  metrics,
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
}: InvoicesListViewModelInput) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { subscription } = useSubscription();
  const canExportPDF = hasFeatureAccess(subscription, 'pdf_export');
  const canExportExcel = hasFeatureAccess(subscription, 'excel_export');
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
    isInitialLoad,
    invoiceToDelete,
    setInvoiceToDelete,
    deleteError,
    setDeleteError,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleting,
    setIsDeleting,
    addManualIncomeOpen,
    setAddManualIncomeOpen,
    manualIncomeConcept,
    setManualIncomeConcept,
    manualIncomeSubtotal,
    setManualIncomeSubtotal,
    manualIncomeIva,
    setManualIncomeIva,
    manualIncomeFecha,
    setManualIncomeFecha,
    manualIncomeNotes,
    setManualIncomeNotes,
    manualIncomeFormError,
    setManualIncomeFormError,
    editingManualIncome,
    setEditingManualIncome,
    manualIncomeIsPaid,
    setManualIncomeIsPaid,
    manualIncomePaymentDate,
    setManualIncomePaymentDate,
    manualIncomeToDelete,
    setManualIncomeToDelete,
    manualIncomeDeleteConfirmation,
    setManualIncomeDeleteConfirmation,
    manualIncomeDeleteError,
    setManualIncomeDeleteError,
    isDeletingManualIncome,
    setIsDeletingManualIncome,
  } = useInvoicesListUiState({
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
    const options = [{ value: 'all', label: 'Todos' }];
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
    if (selectedProfileId) params.set('profileId', selectedProfileId);
    if (selectedRegimenFiscal && selectedRegimenFiscal !== 'all') {
      params.set('regimen_fiscal', selectedRegimenFiscal);
    }
    if (search?.trim()) params.set('search', search.trim());
    return `/dashboard/invoices/reporte/preview?${params.toString()}`;
  }, [selectedMes, selectedAño, selectedProfileId, selectedRegimenFiscal, search]);

  function resetManualIncomeForm() {
    setManualIncomeConcept('');
    setManualIncomeSubtotal('');
    setManualIncomeIva('');
    setManualIncomeFecha('');
    setManualIncomeNotes('');
    setManualIncomeFormError(null);
    setEditingManualIncome(null);
    setManualIncomeIsPaid(false);
    setManualIncomePaymentDate('');
  }

  const createManualIncomeMutation = useMutation({
    mutationFn: createManualIncomeClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-incomes'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] });
      setAddManualIncomeOpen(false);
      resetManualIncomeForm();
    },
  });

  const updateManualIncomeMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof updateManualIncomeClient>[1];
    }) => updateManualIncomeClient(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-incomes'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] });
      setEditingManualIncome(null);
      resetManualIncomeForm();
    },
  });

  const canAddManualIncome = !!profileId && !!periodId;
  const isManualIncomeSubmitting =
    createManualIncomeMutation.isPending || updateManualIncomeMutation.isPending;

  const applyFilters = useCallback(() => {
    const profileId =
      selectedProfileId && selectedProfileId !== 'all' ? selectedProfileId : undefined;
    const regimen_fiscal =
      profileId && selectedRegimenFiscal && selectedRegimenFiscal !== 'all'
        ? selectedRegimenFiscal
        : undefined;
    const nextParams = buildListFiltersSearchParams({
      profileId,
      mes: selectedMes,
      año: selectedAño,
      regimen_fiscal,
      page: 1,
      complementPage: 1,
      search: search.trim() || undefined,
    });
    if (
      listFiltersQueryMatchesUrl(
        {
          profileId,
          mes: selectedMes,
          año: selectedAño,
          regimen_fiscal,
          page: 1,
          complementPage: 1,
          search: search.trim() || undefined,
        },
        searchParams
      )
    ) {
      return;
    }

    setStoredDashboardFilters({
      profileId: selectedProfileId || 'all',
      mes: selectedMes,
      año: selectedAño,
    });
    router.push(`/dashboard/invoices?${nextParams.toString()}`);
  }, [
    selectedProfileId,
    selectedMes,
    selectedAño,
    selectedRegimenFiscal,
    search,
    router,
    searchParams,
  ]);

  const runApplyFilters = useEffectEvent(() => {
    applyFilters();
  });

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
    dispatchUi({ type: 'set_initial_load_done' });

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
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const handleProfileChange = (nextProfileId: string) => {
    const nextProfile = profiles.find((profile) => profile.id === nextProfileId);
    const defaultRegimen = getDefaultRegimenFiscalForProfile(nextProfile);
    const nextRegimenFiscal = defaultRegimen ?? 'all';
    dispatchUi({
      type: 'profile_change',
      profileId: nextProfileId,
      regimenFiscal: nextRegimenFiscal,
    });
    setStoredDashboardFilters({ profileId: nextProfileId || 'all' });
    const params = new URLSearchParams(searchParams.toString());
    if (nextProfileId && nextProfileId !== 'all') {
      params.set('profileId', nextProfileId);
    } else {
      params.delete('profileId');
    }
    if (defaultRegimen) {
      params.set('regimen_fiscal', defaultRegimen);
    } else {
      params.delete('regimen_fiscal');
    }
    params.set('page', '1');
    params.set('complementPage', '1');
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const handleComplementPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('complementPage', newPage.toString());
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const showComplementProfileColumn = !profileId;

  const handleOpenAddManualIncome = () => {
    resetManualIncomeForm();
    setEditingManualIncome(null);
    const today = new Date();
    setManualIncomeFecha(today.toISOString().slice(0, 10));
    setAddManualIncomeOpen(true);
  };

  const handleOpenEditManualIncome = (income: ManualIncome) => {
    setEditingManualIncome(income);
    setManualIncomeConcept(income.concept);
    setManualIncomeSubtotal(income.subtotal.toString());
    setManualIncomeIva(income.iva_amount.toString());
    setManualIncomeFecha(income.fecha);
    setManualIncomeNotes(income.notes ?? '');
    setManualIncomeIsPaid(income.is_paid);
    setManualIncomePaymentDate(income.payment_date ?? '');
    setManualIncomeFormError(null);
    setAddManualIncomeOpen(true);
  };

  const handleCloseManualIncomeDialog = (open: boolean) => {
    if (!open && !isManualIncomeSubmitting) {
      setAddManualIncomeOpen(false);
      resetManualIncomeForm();
    }
  };

  const handleSubmitManualIncome = () => {
    setManualIncomeFormError(null);
    const concept = manualIncomeConcept.trim();
    const subtotalNum = Number(manualIncomeSubtotal.replace(/,/g, '.'));
    const ivaNum = Number(manualIncomeIva.replace(/,/g, '.')) || 0;

    if (!concept) {
      setManualIncomeFormError('El concepto es obligatorio.');
      return;
    }
    if (!Number.isFinite(subtotalNum) || subtotalNum < 0) {
      setManualIncomeFormError('El subtotal debe ser un número mayor o igual a 0.');
      return;
    }
    if (!Number.isFinite(ivaNum) || ivaNum < 0) {
      setManualIncomeFormError('El IVA debe ser un número mayor o igual a 0.');
      return;
    }
    if (!manualIncomeFecha) {
      setManualIncomeFormError('La fecha es obligatoria.');
      return;
    }
    const fechaDate = new Date(manualIncomeFecha);
    if (Number.isNaN(fechaDate.getTime())) {
      setManualIncomeFormError('La fecha no es válida.');
      return;
    }
    const fechaStr = manualIncomeFecha;

    if (!profileId || !periodId) {
      setManualIncomeFormError(
        'Faltan perfil o período. Selecciona un perfil y vuelve a intentar.'
      );
      return;
    }

    if (editingManualIncome) {
      updateManualIncomeMutation.mutate(
        {
          id: editingManualIncome.id,
          body: {
            concept,
            subtotal: subtotalNum,
            iva_amount: ivaNum,
            notes: manualIncomeNotes.trim() || null,
            is_paid: manualIncomeIsPaid,
            payment_date: manualIncomeIsPaid ? manualIncomePaymentDate || null : null,
          },
        },
        {
          onError: (error) => {
            setManualIncomeFormError(
              error instanceof ApiError ? error.message : 'Error al actualizar el ingreso.'
            );
          },
        }
      );
    } else {
      createManualIncomeMutation.mutate(
        {
          profile_id: profileId,
          period_id: periodId,
          concept,
          subtotal: subtotalNum,
          iva_amount: ivaNum,
          fecha: fechaStr,
          notes: manualIncomeNotes.trim() || undefined,
        },
        {
          onError: (error) => {
            setManualIncomeFormError(
              error instanceof ApiError ? error.message : 'Error al crear el ingreso.'
            );
          },
        }
      );
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteError(null);
    setDeleteConfirmation('');
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open && !isDeleting) {
      setInvoiceToDelete(null);
      setDeleteError(null);
      setDeleteConfirmation('');
    }
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] }),
      ]);
    } catch (error) {
      setDeleteError(getInvoiceDeleteErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteManualIncomeClick = (income: ManualIncome) => {
    setManualIncomeToDelete(income);
    setManualIncomeDeleteError(null);
    setManualIncomeDeleteConfirmation('');
  };

  const handleCloseManualIncomeDeleteDialog = (open: boolean) => {
    if (!open && !isDeletingManualIncome) {
      setManualIncomeToDelete(null);
      setManualIncomeDeleteError(null);
      setManualIncomeDeleteConfirmation('');
    }
  };

  const handleConfirmDeleteManualIncome = async () => {
    if (!manualIncomeToDelete) return;
    setIsDeletingManualIncome(true);
    setManualIncomeDeleteError(null);
    try {
      await deleteManualIncomeClient(manualIncomeToDelete.id);
      setManualIncomeToDelete(null);
      setManualIncomeDeleteConfirmation('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['manual-incomes'] }),
        queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] }),
      ]);
    } catch (error) {
      setManualIncomeDeleteError(getManualIncomeDeleteErrorMessage(error));
    } finally {
      setIsDeletingManualIncome(false);
    }
  };

  const handleExportPDF = async () => {
    const profileForExport = profiles.find((p) => p.id === selectedProfileId);
    const normalizedInvoices = normalizeInvoicesForExport(invoices);
    const totalFacturado = normalizedInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const facturasPagadas = normalizedInvoices.filter((inv) => {
      if (inv.tipo === 'PUE') return true;
      if (inv.tipo === 'PPD') return inv.complemento_pago !== null;
      return false;
    });
    const totalPagado = facturasPagadas.reduce((sum, inv) => sum + inv.total, 0);
    const pendientePorPagar = totalFacturado - totalPagado;

    await exportToPDF({
      tipo: 'facturas',
      invoices: normalizedInvoices,
      profileName: profileForExport?.nombre || 'Todos los perfiles',
      rfc: profileForExport?.rfc || '',
      mes: selectedMes,
      año: selectedAño,
      metrics: {
        totalFacturado,
        totalPagado,
        totalCompras: 0,
        pendientePorPagar,
        diferencia: 0,
        totalFacturas: normalizedInvoices.length,
        facturasPUE: normalizedInvoices.filter((inv) => inv.tipo === 'PUE').length,
        facturasPPD: normalizedInvoices.filter((inv) => inv.tipo === 'PPD').length,
      },
    });
  };

  const handleExportExcel = async () => {
    const profileForExport = profiles.find((p) => p.id === selectedProfileId);
    const normalizedInvoices = normalizeInvoicesForExport(invoices);
    const facturasPagadas = normalizedInvoices.filter(
      (inv) =>
        inv.tipo === 'PUE' ||
        (inv.tipo === 'PPD' && (inv.pagos?.reduce((s, p) => s + p.monto, 0) ?? 0) >= inv.total)
    );
    const totalFacturado = normalizedInvoices
      .filter((inv) => inv.tipo !== 'COMPLEMENTO_PAGO')
      .reduce((sum, inv) => sum + inv.total, 0);
    const totalPagado = facturasPagadas.reduce((sum, inv) => sum + inv.total, 0);
    const pendientePorPagar = totalFacturado - totalPagado;

    await exportToExcel({
      tipo: 'facturas',
      invoices: normalizedInvoices,
      profileName: profileForExport?.nombre || 'Todos los perfiles',
      rfc: profileForExport?.rfc || '',
      mes: selectedMes,
      año: selectedAño,
      metrics: {
        totalFacturado,
        totalPagado,
        totalCompras: 0,
        pendientePorPagar,
        diferencia: 0,
        totalFacturas: normalizedInvoices.length,
        facturasPUE: normalizedInvoices.filter((inv) => inv.tipo === 'PUE').length,
        facturasPPD: normalizedInvoices.filter((inv) => inv.tipo === 'PPD').length,
      },
    });
  };

  return {
    profiles,
    selectedProfileId,
    selectedMes,
    setSelectedMes,
    selectedAño,
    setSelectedAño,
    selectedRegimenFiscal,
    setSelectedRegimenFiscal,
    regimenOptions,
    selectedProfile,
    search,
    setSearch,
    handleClearFilters,
    exportPdfHref,
    handleExportPDF,
    canExportPDF,
    handleExportExcel,
    canExportExcel,
    handleOpenAddManualIncome,
    canAddManualIncome,
    manualIncomeDisabledReason,
    metrics,
    manualIncomes,
    manualIncomesState,
    handleOpenEditManualIncome,
    handleDeleteManualIncomeClick,
    invoices,
    tableState,
    handleDeleteClick,
    pagination,
    handlePageChange,
    paymentComplements,
    paymentComplementsPagination,
    complementPage,
    handleComplementPageChange,
    paymentComplementsState,
    paymentComplementsError,
    showComplementProfileColumn,
    handleProfileChange,
    invoiceToDelete,
    deleteConfirmation,
    setDeleteConfirmation,
    deleteError,
    isDeleting,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    manualIncomeToDelete,
    manualIncomeDeleteConfirmation,
    setManualIncomeDeleteConfirmation,
    manualIncomeDeleteError,
    isDeletingManualIncome,
    handleCloseManualIncomeDeleteDialog,
    handleConfirmDeleteManualIncome,
    addManualIncomeOpen,
    editingManualIncome,
    manualIncomeConcept,
    setManualIncomeConcept,
    manualIncomeSubtotal,
    setManualIncomeSubtotal,
    manualIncomeIva,
    setManualIncomeIva,
    manualIncomeFecha,
    setManualIncomeFecha,
    manualIncomeNotes,
    setManualIncomeNotes,
    manualIncomeIsPaid,
    setManualIncomeIsPaid,
    manualIncomePaymentDate,
    setManualIncomePaymentDate,
    manualIncomeFormError,
    isManualIncomeSubmitting,
    handleCloseManualIncomeDialog,
    handleSubmitManualIncome,
  };
}
