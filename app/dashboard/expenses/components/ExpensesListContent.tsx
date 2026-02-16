'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileX, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExpensesSummaryCards } from './ExpensesSummaryCards';
import { ExpensesHeader } from './ExpensesHeader';
import { ManualExpenseDialog } from './ManualExpenseDialog';
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
import type { Expense } from '@/lib/types/expenses';
import type { Profile } from '@/lib/types/profiles';
import type { Subscription } from '@/lib/types/subscription';
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
import { TableRowsSkeleton } from '@/components/common/skeletons/TableRowsSkeleton';

interface ExpensesListContentProps {
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
}

/** Categorías para gastos manuales (edición y tabla). No confundir con el filtro de régimen fiscal. */
const CATEGORIES = [
  { value: 'Viáticos', label: 'Viáticos' },
  { value: 'Oficina', label: 'Oficina' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Alimentación', label: 'Alimentación' },
];

const getCategoryBadge = (categoria: string | null) => {
  if (!categoria) return null;

  const categoryColors: Record<string, string> = {
    Viáticos: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Oficina: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Servicios: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Transporte: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Alimentación: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const colorClass = categoryColors[categoria] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <Badge variant="outline" className={colorClass}>
      {categoria}
    </Badge>
  );
};

const getOriginBadge = (tipoOrigen: 'XML' | 'MANUAL') => {
  if (tipoOrigen === 'XML') {
    return <Badge className="bg-green-500 text-white hover:bg-green-600">XML</Badge>;
  }
  return (
    <Badge variant="secondary" className="border-orange-500/30 bg-orange-500/20 text-orange-400">
      Manual
    </Badge>
  );
};

export function ExpensesListContent({
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
}: ExpensesListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isSyncingFromUrlRef = useRef(false);
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId || 'all');
  const [selectedMes, setSelectedMes] = useState(initialMes || new Date().getMonth() + 1);
  const [selectedAño, setSelectedAño] = useState(initialAño || new Date().getFullYear());
  const [selectedRegimenFiscal, setSelectedRegimenFiscal] = useState(initialRegimenFiscal || 'all');

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const regimenesQuery = useQuery({
    queryKey: ['regimenes-fiscales'],
    queryFn: () => getRegimenesFiscalesClient(),
    enabled: !!selectedProfile?.regimenes_fiscales?.length,
    staleTime: 5 * 60 * 1000,
  });

  const regimenOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'Todos los regímenes' }];
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
    if (selectedProfileId && selectedProfileId !== 'all') params.set('profileId', selectedProfileId);
    if (selectedRegimenFiscal && selectedRegimenFiscal !== 'all')
      params.set('regimen_fiscal', selectedRegimenFiscal);
    if (search?.trim()) params.set('search', search.trim());
    return `/dashboard/expenses/reporte/preview?${params.toString()}`;
  }, [selectedMes, selectedAño, selectedProfileId, selectedRegimenFiscal, search]);
  const [isManualExpenseDialogOpen, setIsManualExpenseDialogOpen] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingManualExpense, setEditingManualExpense] = useState<Expense | null>(null);
  const [editConcept, setEditConcept] = useState('');
  const [editSubtotal, setEditSubtotal] = useState('');
  const [editIva, setEditIva] = useState('');
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editPaymentDate, setEditPaymentDate] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdatingManual, setIsUpdatingManual] = useState(false);

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
    router.push(`/dashboard/expenses?${params.toString()}`);
  }, [selectedProfileId, selectedMes, selectedAño, selectedRegimenFiscal, search, router]);

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
    router.push(`/dashboard/expenses?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/expenses?${params.toString()}`);
  };

  const canExportExcel = hasFeatureAccess(subscription ?? null, 'excel_export');

  const handleExportPDF = async () => {
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
    const normalizedExpenses = normalizeExpensesForExport(expenses);
    const totalGastos = normalizedExpenses.reduce((sum, exp) => sum + exp.total, 0);

    await exportToPDF({
      tipo: 'gastos',
      expenses: normalizedExpenses,
      profileName: selectedProfile?.nombre || 'Todos los perfiles',
      rfc: selectedProfile?.rfc || '',
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
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
    const normalizedExpenses = normalizeExpensesForExport(expenses);
    const totalGastos = normalizedExpenses.reduce((sum, exp) => sum + exp.total, 0);

    await exportToExcel({
      tipo: 'gastos',
      expenses: normalizedExpenses,
      profileName: selectedProfile?.nombre || 'Todos los perfiles',
      rfc: selectedProfile?.rfc || '',
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

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    setSelectedRegimenFiscal('all');
    const params = new URLSearchParams(searchParams.toString());
    if (profileId && profileId !== 'all') {
      params.set('profileId', profileId);
    } else {
      params.delete('profileId');
    }
    params.delete('regimen_fiscal');
    params.set('page', '1');
    router.push(`/dashboard/expenses?${params.toString()}`);
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
    });
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteError(null);
    setDeleteConfirmation('');
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open && !isDeleting) {
      setExpenseToDelete(null);
      setDeleteError(null);
      setDeleteConfirmation('');
    }
  };

  const getDeleteErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        return 'No tienes permisos para eliminar este gasto.';
      }
      if (error.status === 404) {
        return 'El gasto ya no existe o fue eliminado.';
      }
      if (error.status === 400) {
        return error.message || 'No se puede eliminar este gasto.';
      }
      return error.message || 'Error al eliminar el gasto.';
    }
    return 'Error inesperado al eliminar el gasto. Por favor intenta nuevamente.';
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

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
      setExpenseToDelete(null);
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteKeyword = 'ELIMINAR';
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== deleteKeyword;

  const handleOpenEditManual = (expense: Expense) => {
    setEditingManualExpense(expense);
    setEditConcept(expense.concepto ?? '');
    setEditSubtotal(expense.subtotal.toString());
    setEditIva((expense.iva_amount ?? expense.iva ?? 0).toString());
    setEditIsPaid(expense.is_paid ?? false);
    setEditPaymentDate(expense.payment_date ?? '');
    setEditCategoria(expense.categoria ?? '');
    setEditError(null);
  };

  const handleCloseEditManual = () => {
    if (!isUpdatingManual) {
      setEditingManualExpense(null);
      setEditError(null);
    }
  };

  const handleSubmitEditManual = async () => {
    if (!editingManualExpense) return;
    setEditError(null);
    const concept = editConcept.trim();
    const subtotalNum = Number(editSubtotal.replace(/,/g, '.'));
    const ivaNum = Number(editIva.replace(/,/g, '.')) || 0;
    if (!concept) {
      setEditError('El concepto es obligatorio.');
      return;
    }
    if (!Number.isFinite(subtotalNum) || subtotalNum < 0) {
      setEditError('El subtotal debe ser un número ≥ 0.');
      return;
    }
    if (!Number.isFinite(ivaNum) || ivaNum < 0) {
      setEditError('El IVA debe ser un número ≥ 0.');
      return;
    }
    setIsUpdatingManual(true);
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
      setEditingManualExpense(null);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Error al actualizar el gasto.');
    } finally {
      setIsUpdatingManual(false);
    }
  };

  const getPaymentStatusBadge = (expense: Expense) => {
    // Solo mostrar estado de pago para gastos XML con tipo PUE o PPD
    if (expense.tipo_origen !== 'XML' || !expense.tipo || expense.tipo === 'COMPLEMENTO_PAGO') {
      return null;
    }

    // Para gastos PUE, siempre están pagados
    if (expense.tipo === 'PUE') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ Pagado</Badge>;
    }

    // Para gastos PPD, verificar estado de pago
    if (expense.tipo === 'PPD') {
      const estadoPago = expense.estadoPago;

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

    return null;
  };

  // Calcular métricas desde los gastos filtrados
  const xmlExpenses = expenses.filter((e) => e.tipo_origen === 'XML');
  const manualExpenses =
    periodId != null
      ? manualExpensesFromPeriod
      : expenses.filter((e) => e.tipo_origen === 'MANUAL');
  const validXmlExpenses = xmlExpenses.filter((e) => e.validacion?.valido);
  const canAddManualExpense = !!profileId && !!periodId;

  // Calcular el total sumando todos los gastos (en pesos)
  const totalExpensesAmount = expenses.reduce((sum, expense) => {
    const total =
      typeof expense.total === 'number' ? expense.total : parseFloat(expense.total) || 0;
    return sum + total;
  }, 0);

  return (
    <>
      <ExpensesHeader
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onProfileChange={handleProfileChange}
        selectedMes={selectedMes}
        onMesChange={(m) => setSelectedMes(m)}
        selectedAño={selectedAño}
        onAñoChange={(a) => setSelectedAño(a)}
        selectedRegimenFiscal={selectedRegimenFiscal}
        onRegimenFiscalChange={setSelectedRegimenFiscal}
        regimenOptions={regimenOptions}
        isRegimenDisabled={!selectedProfile?.regimenes_fiscales?.length}
        search={search}
        onSearchChange={setSearch}
        onClearFilters={handleClearFilters}
        exportPdfHref={exportPdfHref}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        canExportExcel={canExportExcel}
        onAddManualExpense={() => setIsManualExpenseDialogOpen(true)}
        canAddManualExpense={canAddManualExpense}
        manualExpenseDisabledReason={manualExpenseDisabledReason}
      />

      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* Summary Cards */}
        <ExpensesSummaryCards
          totalExpenses={totalExpensesAmount}
          xmlProcessed={xmlExpenses.length}
          validXmlPercentage={
            xmlExpenses.length > 0 ? (validXmlExpenses.length / xmlExpenses.length) * 100 : 0
          }
          manualExpenses={manualExpenses.length}
          selectedMonth={selectedMes}
        />

        {/* Gastos manuales del período */}
        {canAddManualExpense ? (
          <div className="bg-card overflow-hidden rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-muted-foreground text-sm font-medium">
                Gastos manuales (sin factura CFDI)
              </h2>
            </div>
            <div className="relative overflow-x-auto">
              {manualExpensesState === 'loading' ? (
                <div className="p-6">
                  <TableRowsSkeleton rows={3} />
                </div>
              ) : manualExpensesFromPeriod.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Receipt}
                    title="Sin gastos manuales"
                    description="Los gastos que registres aquí no tienen factura CFDI. Usa el botón «Gasto manual» para agregar uno."
                    actionLabel="Agregar gasto manual"
                    onAction={() => setIsManualExpenseDialogOpen(true)}
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
                      <TableHead className="min-w-22.5">Pagado</TableHead>
                      <TableHead className="min-w-20 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualExpensesFromPeriod.map((expense) => {
                      const total = expense.subtotal + (expense.iva_amount ?? expense.iva ?? 0);
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {expense.concepto || 'Sin concepto'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(expense.fecha)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(expense.subtotal)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right tabular-nums">
                            {formatCurrency(expense.iva_amount ?? expense.iva ?? 0)}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell>
                            {expense.is_paid ? (
                              <Badge className="bg-green-500/10 text-green-600">Sí</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditManual(expense)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(expense)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              {manualExpensesState === 'updating' && manualExpensesFromPeriod.length > 0 && (
                <div className="bg-background/80 absolute inset-0 backdrop-blur-[1px]" />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg border border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">
              {manualExpenseDisabledReason === 'no_profile'
                ? 'Selecciona un perfil en el selector de arriba (no «Todos») para ver y agregar gastos manuales.'
                : 'No se obtuvo un período para este perfil y mes/año. El backend debe devolver el ID del período en métricas.'}
            </p>
          </div>
        )}

        {/* Expenses Table */}
        <div data-tour="expenses-table" className="bg-card overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <div className="relative max-h-150 overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="min-w-30">FECHA</TableHead>
                    <TableHead className="min-w-62.5">EMISOR / CONCEPTO</TableHead>
                    <TableHead className="min-w-37.5">CATEGORÍA</TableHead>
                    <TableHead className="min-w-25">ORIGEN</TableHead>
                    <TableHead className="min-w-37.5">UUID</TableHead>
                    <TableHead className="min-w-27.5 text-right">MONTO</TableHead>
                    <TableHead className="min-w-25 text-right">IVA TRASL.</TableHead>
                    <TableHead className="min-w-23.75 text-right">RET. IVA</TableHead>
                    <TableHead className="min-w-23.75 text-right">RET. ISR</TableHead>
                    <TableHead className="min-w-30">ESTADO PAGO</TableHead>
                    <TableHead className="min-w-25 text-right">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(expense.fecha)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-62.5">
                            <p
                              className="truncate text-sm font-medium"
                              title={expense.nombre_emisor || 'Sin emisor'}
                            >
                              {expense.nombre_emisor || 'Sin emisor'}
                            </p>
                            <p
                              className="text-muted-foreground truncate text-xs"
                              title={expense.concepto || 'Sin concepto'}
                            >
                              {expense.concepto || 'Sin concepto'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(expense.categoria)}</TableCell>
                        <TableCell>{getOriginBadge(expense.tipo_origen)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <div className="max-w-37.5 truncate" title={expense.uuid || '--'}>
                            {expense.uuid
                              ? `${expense.uuid.slice(0, 8)}...${expense.uuid.slice(-4)}`
                              : '--'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                          {formatCurrency(expense.subtotal)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                          {formatCurrency(expense.iva_amount ?? expense.iva ?? 0)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                          {formatCurrency(expense.retencion_iva_amount ?? 0)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right whitespace-nowrap tabular-nums">
                          {formatCurrency(expense.retencion_isr_amount ?? 0)}
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(expense)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar gasto"
                              onClick={() => handleDeleteClick(expense)}
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
                      <TableCell colSpan={11} className="py-8">
                        <EmptyState
                          icon={FileX}
                          title={
                            search
                              ? `No se encontraron gastos que coincidan con "${search}"`
                              : 'No se encontraron gastos'
                          }
                          description={
                            search
                              ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                              : 'Comienza subiendo archivos XML o creando gastos manuales'
                          }
                          actionLabel={search ? undefined : 'Subir Gastos XML'}
                          actionHref={search ? undefined : '/dashboard/expenses/upload'}
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
              resultados
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
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
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Manual Expense Dialog */}
        {selectedProfileId && periodId && (
          <ManualExpenseDialog
            isOpen={isManualExpenseDialogOpen}
            onClose={() => setIsManualExpenseDialogOpen(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['accrued-expenses'] });
              queryClient.invalidateQueries({ queryKey: ['invoice-metrics'] });
              queryClient.invalidateQueries({ queryKey: ['expenses'] });
            }}
            profileId={selectedProfileId}
            periodId={periodId}
            profiles={profiles}
            subscription={subscription}
            expensesUsed={expensesUsed}
          />
        )}

        {/* Edit Manual Expense Dialog */}
        <Dialog
          open={!!editingManualExpense}
          onOpenChange={(open) => !open && handleCloseEditManual()}
        >
          <DialogContent className="sm:max-w-105">
            <DialogHeader>
              <DialogTitle>Editar gasto manual</DialogTitle>
              <DialogDescription>
                Actualiza concepto, montos o estado de pago. No incluye factura CFDI.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-concept">Concepto</Label>
                <Input
                  id="edit-concept"
                  value={editConcept}
                  onChange={(e) => setEditConcept(e.target.value)}
                  placeholder="Ej. Viáticos marzo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-subtotal">Subtotal (MXN)</Label>
                  <Input
                    id="edit-subtotal"
                    type="text"
                    inputMode="decimal"
                    value={editSubtotal}
                    onChange={(e) => setEditSubtotal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-iva">IVA (MXN)</Label>
                  <Input
                    id="edit-iva"
                    type="text"
                    inputMode="decimal"
                    value={editIva}
                    onChange={(e) => setEditIva(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="edit-paid">Pagado</Label>
                  <p className="text-muted-foreground text-sm">Marca si ya pagaste este gasto.</p>
                </div>
                <Switch id="edit-paid" checked={editIsPaid} onCheckedChange={setEditIsPaid} />
              </div>
              {editIsPaid && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-payment-date">Fecha de pago</Label>
                  <Input
                    id="edit-payment-date"
                    type="date"
                    value={editPaymentDate}
                    onChange={(e) => setEditPaymentDate(e.target.value)}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Select
                  value={editCategoria || 'none'}
                  onValueChange={(v) => setEditCategoria(v === 'none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editError && (
                <Alert variant="destructive">
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditManual} disabled={isUpdatingManual}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitEditManual} disabled={isUpdatingManual}>
                {isUpdatingManual ? 'Guardando...' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Warning Dialog */}
        <Dialog open={showProfileWarning} onOpenChange={setShowProfileWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Empresa no seleccionada</DialogTitle>
              <DialogDescription>
                Por favor selecciona una empresa antes de agregar un gasto manual.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowProfileWarning(false)}>Entendido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Expense Dialog */}
        <Dialog open={!!expenseToDelete} onOpenChange={handleCloseDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar gasto</DialogTitle>
              <DialogDescription>
                Esta acción eliminará el gasto seleccionado y no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            {expenseToDelete && (
              <div className="rounded-lg border p-4 text-sm">
                <p className="font-medium">{expenseToDelete.nombre_emisor || 'Sin emisor'}</p>
                <p className="text-muted-foreground">
                  {expenseToDelete.concepto || 'Sin concepto'}
                </p>
                <p className="text-muted-foreground mt-1">
                  Total: {formatCurrency(expenseToDelete.total)}
                </p>
                {expenseToDelete.uuid && (
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    UUID: {expenseToDelete.uuid}
                  </p>
                )}
              </div>
            )}
            {expenseToDelete && (
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
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleteBlocked}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
