'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, FileText, X, FileX, Trash2, Download } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExpensesSummaryCards } from './ExpensesSummaryCards';
import { ProfileSelector } from './ProfileSelector';
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
import {
  exportToPDF,
  normalizeExpensesForExport,
} from '@/lib/utils/pdf-export';
import { deleteExpense } from '@/lib/api/expenses.client';
import { ApiError } from '@/lib/api/client';

interface ExpensesListContentProps {
  expenses: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  profiles: Profile[];
  subscription?: Subscription | null;
  expensesUsed?: number;
  initialProfileId?: string;
  initialMes?: number;
  initialAño?: number;
  initialCategoria?: string;
  initialSearch?: string;
}

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
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
  subscription,
  expensesUsed = 0,
  initialProfileId,
  initialMes,
  initialAño,
  initialCategoria,
  initialSearch,
}: ExpensesListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId || 'all');
  const [selectedMes, setSelectedMes] = useState(initialMes || new Date().getMonth() + 1);
  const [selectedAño, setSelectedAño] = useState(initialAño || new Date().getFullYear());
  const [selectedCategoria, setSelectedCategoria] = useState(initialCategoria || 'all');
  const [isManualExpenseDialogOpen, setIsManualExpenseDialogOpen] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedProfileId && selectedProfileId !== 'all')
      params.set('profileId', selectedProfileId);
    if (selectedMes) params.set('mes', selectedMes.toString());
    if (selectedAño) params.set('año', selectedAño.toString());
    if (selectedCategoria && selectedCategoria !== 'all')
      params.set('categoria', selectedCategoria);
    if (search) params.set('search', search);
    params.set('page', '1');
    router.push(`/dashboard/expenses?${params.toString()}`);
  }, [selectedProfileId, selectedMes, selectedAño, selectedCategoria, search, router]);

  // Aplicar filtros automáticamente cuando cambien (excepto búsqueda)
  useEffect(() => {
    // Solo aplicar si no es la carga inicial
    if (
      selectedMes !== initialMes ||
      selectedAño !== initialAño ||
      selectedCategoria !== initialCategoria
    ) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMes, selectedAño, selectedCategoria]); // Solo estos filtros se aplican automáticamente

  // Marcar que la carga inicial ya terminó
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Debounce para la búsqueda - SOLO se ejecuta cuando cambia search
  useEffect(() => {
    if (isInitialLoad) return;

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
    setSelectedCategoria('all');
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

  const handleExportPDF = async () => {
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
    const normalizedExpenses = normalizeExpensesForExport(expenses);
    const totalGastos = normalizedExpenses.reduce(
      (sum, exp) => sum + exp.total,
      0
    );

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

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const params = new URLSearchParams(searchParams.toString());
    if (profileId && profileId !== 'all') {
      params.set('profileId', profileId);
    } else {
      params.delete('profileId');
    }
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
      await deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      router.refresh();
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteKeyword = 'ELIMINAR';
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== deleteKeyword;

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
  const manualExpenses = expenses.filter((e) => e.tipo_origen === 'MANUAL');
  const validXmlExpenses = xmlExpenses.filter((e) => e.validacion?.valido);

  // Calcular el total sumando todos los gastos (en pesos)
  const totalExpensesAmount = expenses.reduce((sum, expense) => {
    const total =
      typeof expense.total === 'number' ? expense.total : parseFloat(expense.total) || 0;
    return sum + total;
  }, 0);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Gastos</h1>
          <p className="text-muted-foreground mt-2">
            Administra y monitorea todos tus gastos y egresos fiscales.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div data-tour="expenses-profile-selector">
            <ProfileSelector
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              onProfileChange={handleProfileChange}
            />
          </div>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            data-tour="expenses-manual-button"
            variant="outline"
            className="border-primary/20 hover:bg-primary/10"
            onClick={() => {
              if (!selectedProfileId) {
                setShowProfileWarning(true);
                return;
              }
              setIsManualExpenseDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Gasto Manual
          </Button>
          <Link href="/dashboard/expenses/upload">
            <Button data-tour="expenses-upload-button" className="bg-primary hover:bg-primary/90">
              <FileText className="mr-2 h-4 w-4" />
              Cargar Gastos XML
            </Button>
          </Link>
        </div>
      </div>

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

      {/* Search and Filters */}
      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Concepto, Emisor o UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="CATEGORÍA" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMes.toString()} onValueChange={(v) => setSelectedMes(Number(v))}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={index} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedAño.toString()} onValueChange={(v) => setSelectedAño(Number(v))}>
          <SelectTrigger className="w-full md:w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleClearFilters} variant="outline" className="w-full md:w-auto">
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>

      {/* Expenses Table */}
      <div data-tour="expenses-table" className="bg-card overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="min-w-[120px]">FECHA</TableHead>
                  <TableHead className="min-w-[250px]">EMISOR / CONCEPTO</TableHead>
                  <TableHead className="min-w-[150px]">CATEGORÍA</TableHead>
                  <TableHead className="min-w-[100px]">ORIGEN</TableHead>
                  <TableHead className="min-w-[150px]">UUID</TableHead>
                  <TableHead className="min-w-[120px]">TOTAL</TableHead>
                  <TableHead className="min-w-[120px]">ESTADO PAGO</TableHead>
                  <TableHead className="min-w-[120px] text-right">ACCIONES</TableHead>
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
                        <div className="max-w-[250px]">
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
                        <div className="max-w-[150px] truncate" title={expense.uuid || '--'}>
                          {expense.uuid
                            ? `${expense.uuid.slice(0, 8)}...${expense.uuid.slice(-4)}`
                            : '--'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatCurrency(expense.total)}
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
                    <TableCell colSpan={8} className="py-8">
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
      {selectedProfileId && (
        <ManualExpenseDialog
          isOpen={isManualExpenseDialogOpen}
          onClose={() => setIsManualExpenseDialogOpen(false)}
          subscription={subscription}
          expensesUsed={expensesUsed}
          profileId={selectedProfileId}
          profiles={profiles}
        />
      )}

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
              <p className="text-muted-foreground">{expenseToDelete.concepto || 'Sin concepto'}</p>
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
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleteBlocked}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
