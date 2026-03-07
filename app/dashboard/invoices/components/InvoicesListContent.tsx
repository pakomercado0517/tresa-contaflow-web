'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileX, Trash2, HandCoins, Pencil } from 'lucide-react';
import { InvoicesHeader } from './InvoicesHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SummaryCards } from './SummaryCards';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Invoice } from '@/lib/types/invoices';
import type { Profile } from '@/lib/types/profiles';
import type { ManualIncome } from '@/lib/types/manual-incomes';
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
import { TableRowsSkeleton } from '@/components/common/skeletons/TableRowsSkeleton';
import {
  clearStoredProfileSelection,
  getStoredProfileSelection,
  setStoredProfileSelection,
} from '@/lib/storage/profile-selection';

interface InvoicesListContentProps {
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
}

export function InvoicesListContent({
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
}: InvoicesListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { subscription } = useSubscription();
  const canExportPDF = hasFeatureAccess(subscription, 'pdf_export');
  const canExportExcel = hasFeatureAccess(subscription, 'excel_export');
  const isSyncingFromUrlRef = useRef(false);
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId || 'all');
  const [selectedMes, setSelectedMes] = useState(initialMes || new Date().getMonth() + 1);
  const [selectedAño, setSelectedAño] = useState(initialAño || new Date().getFullYear());
  const [selectedRegimenFiscal, setSelectedRegimenFiscal] = useState(initialRegimenFiscal || 'all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [addManualIncomeOpen, setAddManualIncomeOpen] = useState(false);
  const [manualIncomeConcept, setManualIncomeConcept] = useState('');
  const [manualIncomeSubtotal, setManualIncomeSubtotal] = useState('');
  const [manualIncomeIva, setManualIncomeIva] = useState('');
  const [manualIncomeFecha, setManualIncomeFecha] = useState('');
  const [manualIncomeNotes, setManualIncomeNotes] = useState('');
  const [manualIncomeFormError, setManualIncomeFormError] = useState<string | null>(null);
  const [editingManualIncome, setEditingManualIncome] = useState<ManualIncome | null>(null);
  const [manualIncomeIsPaid, setManualIncomeIsPaid] = useState(false);
  const [manualIncomePaymentDate, setManualIncomePaymentDate] = useState('');
  const [manualIncomeToDelete, setManualIncomeToDelete] = useState<ManualIncome | null>(null);
  const [manualIncomeDeleteConfirmation, setManualIncomeDeleteConfirmation] = useState('');
  const [manualIncomeDeleteError, setManualIncomeDeleteError] = useState<string | null>(null);
  const [isDeletingManualIncome, setIsDeletingManualIncome] = useState(false);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const regimenesQuery = useQuery({
    queryKey: ['regimenes-fiscales'],
    queryFn: () => getRegimenesFiscalesClient(),
    enabled: !!selectedProfile?.regimenes_fiscales?.length,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const regimenOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'Todos' }];
    const profileRegimenes = selectedProfile?.regimenes_fiscales ?? [];
    if (profileRegimenes.length === 0) return options;

    const catalog = regimenesQuery.data?.data ?? [];
    const descripcionMap = Object.fromEntries(catalog.map((r) => [r.clave, r.descripcion]));

    for (const clave of profileRegimenes) {
      const desc = descripcionMap[clave];
      options.push({
        value: clave,
        label: desc ? `${clave} - ${desc}` : clave,
      });
    }
    return options;
  }, [selectedProfile?.regimenes_fiscales, regimenesQuery.data?.data]);

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

  const getManualIncomeDeleteErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.status === 403) return 'No tienes permisos para eliminar este ingreso.';
      if (error.status === 404) return 'El ingreso ya no existe o fue eliminado.';
      if (error.status === 400) return error.message || 'No se puede eliminar este ingreso.';
      return error.message || 'Error al eliminar el ingreso.';
    }
    return 'Error inesperado al eliminar el ingreso. Por favor intenta nuevamente.';
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

  const manualIncomeDeleteKeyword = 'ELIMINAR';
  const isManualIncomeDeleteBlocked =
    isDeletingManualIncome || manualIncomeDeleteConfirmation.trim() !== manualIncomeDeleteKeyword;

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

  const canAddManualIncome = !!profileId && !!periodId;
  const isManualIncomeSubmitting =
    createManualIncomeMutation.isPending || updateManualIncomeMutation.isPending;

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
    router.push(`/dashboard/invoices?${params.toString()}`);
  }, [selectedProfileId, selectedMes, selectedAño, selectedRegimenFiscal, search, router]);

  useEffect(() => {
    const urlProfileId = searchParams.get('profileId');
    if (urlProfileId) {
      setStoredProfileSelection(urlProfileId);
      return;
    }

    const storedProfileId = getStoredProfileSelection();
    if (!storedProfileId || storedProfileId === 'all') return;
    if (profiles.length === 0) return;

    const storedProfileExists = profiles.some(
      (profile) => profile.id === storedProfileId && !profile.frozen
    );
    if (!storedProfileExists) {
      clearStoredProfileSelection();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('profileId', storedProfileId);
    params.set('page', '1');
    router.replace(`/dashboard/invoices?${params.toString()}`);
  }, [searchParams, profiles, router]);

  // Sincronizar estado interno con URL (permite back/forward sin desalineación)
  useEffect(() => {
    const urlProfileId = searchParams.get('profileId') ?? 'all';
    const urlMes = Number(searchParams.get('mes') ?? new Date().getMonth() + 1);
    const urlAño = Number(searchParams.get('año') ?? new Date().getFullYear());
    const urlRegimen = searchParams.get('regimen_fiscal') ?? 'all';
    const urlSearch = searchParams.get('search') ?? '';

    isSyncingFromUrlRef.current = true;
    setSelectedProfileId(urlProfileId);
    setSelectedMes(urlMes);
    setSelectedAño(urlAño);
    setSelectedRegimenFiscal(urlRegimen);
    setSearch(urlSearch);

    const timeout = window.setTimeout(() => {
      isSyncingFromUrlRef.current = false;
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  // Aplicar filtros automáticamente cuando cambien (excepto búsqueda)
  useEffect(() => {
    if (isInitialLoad) return;
    if (isSyncingFromUrlRef.current) return;
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMes, selectedAño, selectedRegimenFiscal]); // Solo estos filtros se aplican automáticamente

  // Marcar que la carga inicial ya terminó
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Debounce para la búsqueda - SOLO se ejecuta cuando cambia search
  useEffect(() => {
    if (isInitialLoad) return;
    if (isSyncingFromUrlRef.current) return;

    const timer = setTimeout(() => {
      applyFilters();
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // SOLO search como dependencia

  const handleClearFilters = () => {
    setSearch('');
    setSelectedMes(new Date().getMonth() + 1);
    setSelectedAño(new Date().getFullYear());
    setSelectedRegimenFiscal('all');
    // El perfil no se resetea porque es un filtro principal
    const params = new URLSearchParams();
    if (selectedProfileId && selectedProfileId !== 'all')
      params.set('profileId', selectedProfileId);
    params.set('mes', (new Date().getMonth() + 1).toString());
    params.set('año', new Date().getFullYear().toString());
    params.set('page', '1');
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    setSelectedRegimenFiscal('all'); // Reset régimen al cambiar perfil
    setStoredProfileSelection(profileId || 'all');
    const params = new URLSearchParams(searchParams.toString());
    if (profileId && profileId !== 'all') {
      params.set('profileId', profileId);
    } else {
      params.delete('profileId');
    }
    params.delete('regimen_fiscal');
    params.set('page', '1');
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getDeleteErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        return 'No tienes permisos para eliminar esta factura.';
      }
      if (error.status === 404) {
        return 'La factura ya no existe o fue eliminada.';
      }
      if (error.status === 400) {
        return error.message || 'No se puede eliminar esta factura.';
      }
      return error.message || 'Error al eliminar la factura.';
    }
    return 'Error inesperado al eliminar la factura. Por favor intenta nuevamente.';
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
      setDeleteError(getDeleteErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteKeyword = 'ELIMINAR';
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== deleteKeyword;

  const handleExportPDF = async () => {
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
    const normalizedInvoices = normalizeInvoicesForExport(invoices);

    // Calcular métricas para el resumen
    const totalFacturado = normalizedInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Las facturas PUE están pagadas automáticamente
    // Las facturas PPD están pagadas si tienen complementos de pago o están completamente pagadas
    const facturasPagadas = normalizedInvoices.filter((inv) => {
      if (inv.tipo === 'PUE') return true;
      if (inv.tipo === 'PPD') return inv.complemento_pago !== null;
      return false;
    });
    const totalPagado = facturasPagadas.reduce((sum, inv) => sum + inv.total, 0);
    const pendientePorPagar = totalFacturado - totalPagado;

    const payload = {
      tipo: 'facturas',
      invoices: normalizedInvoices,
      profileName: selectedProfile?.nombre || 'Todos los perfiles',
      rfc: selectedProfile?.rfc || '',
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
    } as const;

    await exportToPDF(payload);
  };

  const handleExportExcel = async () => {
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
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
      profileName: selectedProfile?.nombre || 'Todos los perfiles',
      rfc: selectedProfile?.rfc || '',
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

  const getStatusBadge = (invoice: Invoice) => {
    // Primero mostrar estado de validación
    if (!invoice.validacion?.valido) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTitle className="h-3 w-3" />
          ERROR
        </Badge>
      );
    }

    // Para facturas PUE, siempre están pagadas
    if (invoice.tipo === 'PUE') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ Pagado</Badge>;
    }

    // Para facturas PPD, verificar estado de pago
    if (invoice.tipo === 'PPD') {
      const estadoPago = invoice.estadoPago;

      // Si no hay estadoPago, considerar como no pagado
      if (!estadoPago) {
        return (
          <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-600">
            No Pagado
          </Badge>
        );
      }

      // Si está completamente pagado
      if (estadoPago.completamentePagado || estadoPago.estado === 'PAGADO') {
        return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ Pagado</Badge>;
      }

      // Si tiene pago parcial
      if (estadoPago.estado === 'PAGO_PARCIAL' || estadoPago.porcentajePagado > 0) {
        return (
          <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-600">
            Pago Parcial ({Math.round(estadoPago.porcentajePagado)}%)
          </Badge>
        );
      }

      // Si no está pagado
      return (
        <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-600">
          No Pagado
        </Badge>
      );
    }

    // Para complementos de pago, mostrar como válido
    if (invoice.tipo === 'COMPLEMENTO_PAGO') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ VÁLIDO</Badge>;
    }

    // Default: válido
    return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ VÁLIDO</Badge>;
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <InvoicesHeader
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onProfileChange={handleProfileChange}
        selectedMes={selectedMes}
        onMesChange={setSelectedMes}
        selectedAño={selectedAño}
        onAñoChange={setSelectedAño}
        selectedRegimenFiscal={selectedRegimenFiscal}
        onRegimenFiscalChange={setSelectedRegimenFiscal}
        regimenOptions={regimenOptions}
        isRegimenDisabled={!selectedProfile?.regimenes_fiscales?.length}
        search={search}
        onSearchChange={setSearch}
        onClearFilters={handleClearFilters}
        exportPdfHref={exportPdfHref}
        onExportPDF={handleExportPDF}
        canExportPDF={canExportPDF}
        onExportExcel={handleExportExcel}
        canExportExcel={canExportExcel}
        onAddManualIncome={handleOpenAddManualIncome}
        canAddManualIncome={canAddManualIncome}
        manualIncomeDisabledReason={manualIncomeDisabledReason}
      />

      <div className="w-full min-w-0 space-y-6 p-4 pt-120 md:p-6 md:pt-56 lg:p-8 lg:pt-40">
        {/* Summary Cards */}
        <SummaryCards
          totalCount={metrics.totalFacturas}
          pendingPaymentCount={metrics.facturasPendientesPago}
          totalIncome={metrics.totalFacturado}
        />

        {/* Ingresos manuales */}
        {canAddManualIncome ? (
          <div className="bg-card min-w-0 overflow-hidden rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-muted-foreground text-sm font-medium">
                Ingresos manuales (sin factura CFDI)
              </h2>
            </div>
            <div className="relative min-w-0 overflow-x-auto">
              {manualIncomesState === 'loading' ? (
                <div className="p-6">
                  <TableRowsSkeleton rows={3} />
                </div>
              ) : manualIncomes.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={HandCoins}
                    title="Sin ingresos manuales"
                    description="Los ingresos que registres aquí no tienen factura CFDI. Usa el botón «Ingreso manual» para agregar uno."
                    actionLabel="Agregar ingreso manual"
                    onAction={handleOpenAddManualIncome}
                    variant="empty"
                    compact
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-45">Concepto</TableHead>
                      <TableHead className="min-w-25">Fecha</TableHead>
                      <TableHead className="min-w-25 text-right">Subtotal</TableHead>
                      <TableHead className="min-w-20 text-right">IVA</TableHead>
                      <TableHead className="min-w-25 text-right">Total</TableHead>
                      <TableHead className="min-w-22.5">Cobrado</TableHead>
                      <TableHead className="min-w-20 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualIncomes.map((income) => {
                      const total = income.subtotal + income.iva_amount;
                      return (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{income.concept}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(income.fecha).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(income.subtotal)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right tabular-nums">
                            {formatCurrency(income.iva_amount)}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell>
                            {income.is_paid ? (
                              <Badge className="bg-green-500/10 text-green-600">Sí</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Editar ingreso manual"
                                onClick={() => handleOpenEditManualIncome(income)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Eliminar ingreso manual"
                                onClick={() => handleDeleteManualIncomeClick(income)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              {manualIncomesState === 'updating' && manualIncomes.length > 0 && (
                <div className="bg-background/80 absolute inset-0 backdrop-blur-[1px]" />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg border border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">
              {manualIncomeDisabledReason === 'no_profile'
                ? 'Selecciona un perfil en el selector de arriba (no «Todos») para ver y agregar ingresos manuales.'
                : 'No se obtuvo un período para este perfil y mes/año. El backend debe devolver el ID del período en GET /api/metrics cuando se envía profile_id, mes y año.'}
            </p>
          </div>
        )}

        {/* Invoices Table */}
        <div
          data-tour="invoices-table"
          className="bg-card min-w-0 overflow-hidden rounded-lg border"
        >
          <div className="min-w-0 overflow-x-auto">
            <div className="relative max-h-150 overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="min-w-50">UUID / FOLIO</TableHead>
                    <TableHead className="min-w-37.5">FECHA</TableHead>
                    <TableHead className="min-w-50">EMISOR</TableHead>
                    <TableHead className="min-w-50">RECEPTOR</TableHead>
                    <TableHead className="min-w-27.5 text-right">MONTO</TableHead>
                    <TableHead className="min-w-25 text-right">IVA TRASL.</TableHead>
                    <TableHead className="min-w-25 text-right">RET. IVA</TableHead>
                    <TableHead className="min-w-25 text-right">RET. ISR</TableHead>
                    <TableHead className="min-w-25">ESTADO</TableHead>
                    <TableHead className="min-w-25 text-right">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          <div className="max-w-50 truncate" title={invoice.uuid}>
                            {invoice.uuid || `F-${invoice.id.slice(-4)}`}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(invoice.fecha)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-50">
                            <p
                              className="truncate text-sm font-medium"
                              title={invoice.nombre_emisor}
                            >
                              {invoice.nombre_emisor}
                            </p>
                            <p className="text-muted-foreground text-xs">{invoice.rfc_emisor}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-50">
                            <p
                              className="truncate text-sm font-medium"
                              title={invoice.nombre_receptor}
                            >
                              {invoice.nombre_receptor}
                            </p>
                            <p className="text-muted-foreground text-xs">{invoice.rfc_receptor}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                          {formatCurrency(invoice.subtotal)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                          {formatCurrency(invoice.iva_amount ?? invoice.iva ?? 0)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                          {formatCurrency(invoice.retencion_iva_amount ?? 0)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                          {formatCurrency(invoice.retencion_isr_amount ?? 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar factura"
                              onClick={() => handleDeleteClick(invoice)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8">
                        <EmptyState
                          icon={FileX}
                          title={
                            search
                              ? `No se encontraron facturas que coincidan con "${search}"`
                              : 'No se encontraron facturas'
                          }
                          description={
                            search
                              ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                              : 'Comienza subiendo archivos XML de facturas'
                          }
                          actionLabel={search ? undefined : 'Subir Facturas'}
                          actionHref={search ? undefined : '/dashboard/invoices/upload'}
                          variant="search"
                          compact
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {tableState !== 'idle' && (
                <div className="bg-background/90 absolute inset-0 backdrop-blur-[2px]">
                  <TableRowsSkeleton rows={10} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}{' '}
              facturas
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                ←
              </Button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                <span className="text-muted-foreground px-2">...</span>
              )}
              {pagination.totalPages > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                >
                  {pagination.totalPages}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* end space-y-6 content wrapper */}

      {/* Delete Invoice Dialog */}
      <Dialog open={!!invoiceToDelete} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar factura</DialogTitle>
            <DialogDescription>
              Esta acción eliminará la factura seleccionada y no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {invoiceToDelete && (
            <div className="rounded-lg border p-4 text-sm">
              <p className="font-medium">{invoiceToDelete.nombre_emisor}</p>
              <p className="text-muted-foreground">{invoiceToDelete.concepto || 'Sin concepto'}</p>
              <p className="text-muted-foreground mt-1">
                Total: {formatCurrency(invoiceToDelete.total)}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                UUID: {invoiceToDelete.uuid}
              </p>
            </div>
          )}
          {invoiceToDelete && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Para confirmar, escribe{' '}
                <span className="text-foreground font-mono font-medium">{deleteKeyword}</span>.
              </p>
              <Input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder={deleteKeyword}
                autoComplete="off"
              />
            </div>
          )}
          {deleteError && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo eliminar</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleCloseDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleteBlocked}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Manual Income Dialog */}
      <Dialog open={!!manualIncomeToDelete} onOpenChange={handleCloseManualIncomeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar ingreso manual</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el ingreso seleccionado y no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {manualIncomeToDelete && (
            <div className="rounded-lg border p-4 text-sm">
              <p className="font-medium">{manualIncomeToDelete.concept}</p>
              <p className="text-muted-foreground mt-1">
                Total:{' '}
                {formatCurrency(manualIncomeToDelete.subtotal + manualIncomeToDelete.iva_amount)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Fecha: {new Date(manualIncomeToDelete.fecha).toLocaleDateString('es-MX')}
              </p>
            </div>
          )}
          {manualIncomeToDelete && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Para confirmar, escribe{' '}
                <span className="text-foreground font-mono font-medium">
                  {manualIncomeDeleteKeyword}
                </span>
                .
              </p>
              <Input
                value={manualIncomeDeleteConfirmation}
                onChange={(e) => setManualIncomeDeleteConfirmation(e.target.value)}
                placeholder={manualIncomeDeleteKeyword}
                autoComplete="off"
              />
            </div>
          )}
          {manualIncomeDeleteError && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo eliminar</AlertTitle>
              <AlertDescription>{manualIncomeDeleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleCloseManualIncomeDeleteDialog(false)}
              disabled={isDeletingManualIncome}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteManualIncome}
              disabled={isManualIncomeDeleteBlocked}
            >
              {isDeletingManualIncome ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Manual Income Dialog */}
      <Dialog open={addManualIncomeOpen} onOpenChange={handleCloseManualIncomeDialog}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>
              {editingManualIncome ? 'Editar ingreso manual' : 'Agregar ingreso manual'}
            </DialogTitle>
            <DialogDescription>
              {editingManualIncome
                ? 'Actualiza el concepto, montos o notas. No incluye factura CFDI.'
                : 'Registra un ingreso sin factura CFDI para el período seleccionado.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="manual-income-concept">Concepto</Label>
              <Input
                id="manual-income-concept"
                value={manualIncomeConcept}
                onChange={(e) => setManualIncomeConcept(e.target.value)}
                placeholder="Ej. Honorarios diciembre"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="manual-income-subtotal">Subtotal (MXN)</Label>
                <Input
                  id="manual-income-subtotal"
                  type="text"
                  inputMode="decimal"
                  value={manualIncomeSubtotal}
                  onChange={(e) => setManualIncomeSubtotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manual-income-iva">IVA (MXN)</Label>
                <Input
                  id="manual-income-iva"
                  type="text"
                  inputMode="decimal"
                  value={manualIncomeIva}
                  onChange={(e) => setManualIncomeIva(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-income-fecha">Fecha</Label>
              <Input
                id="manual-income-fecha"
                type="date"
                value={manualIncomeFecha}
                onChange={(e) => setManualIncomeFecha(e.target.value)}
                disabled={!!editingManualIncome}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-income-notes">Notas (opcional)</Label>
              <Input
                id="manual-income-notes"
                value={manualIncomeNotes}
                onChange={(e) => setManualIncomeNotes(e.target.value)}
                placeholder="Cliente, referencia..."
              />
            </div>
            {editingManualIncome && (
              <>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="manual-income-paid">Cobrado</Label>
                    <p className="text-muted-foreground text-sm">
                      Marca si ya recibiste el pago de este ingreso.
                    </p>
                  </div>
                  <Switch
                    id="manual-income-paid"
                    checked={manualIncomeIsPaid}
                    onCheckedChange={setManualIncomeIsPaid}
                  />
                </div>
                {manualIncomeIsPaid && (
                  <div className="grid gap-2">
                    <Label htmlFor="manual-income-payment-date">Fecha de cobro</Label>
                    <Input
                      id="manual-income-payment-date"
                      type="date"
                      value={manualIncomePaymentDate}
                      onChange={(e) => setManualIncomePaymentDate(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
            {manualIncomeFormError && (
              <Alert variant="destructive">
                <AlertDescription>{manualIncomeFormError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleCloseManualIncomeDialog(false)}
              disabled={isManualIncomeSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmitManualIncome} disabled={isManualIncomeSubmitting}>
              {isManualIncomeSubmitting
                ? 'Guardando...'
                : editingManualIncome
                  ? 'Actualizar'
                  : 'Crear ingreso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
