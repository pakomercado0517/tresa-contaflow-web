"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, X, FileX, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SummaryCards } from "./SummaryCards";
import { ProfileSelector } from "./ProfileSelector";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Invoice } from "@/lib/types/invoices";
import type { Profile } from "@/lib/types/profiles";
import { exportToPDF } from "@/lib/utils/pdf-export";
import { deleteInvoice } from "@/lib/api/invoices.client";
import { ApiError } from "@/lib/api/client";

interface InvoicesListContentProps {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  profiles: Profile[];
  metrics: {
    totalFacturado: number;
    totalFacturas: number;
    facturasPUE: number;
    facturasPPD: number;
  };
  initialProfileId?: string;
  initialMes?: number;
  initialAño?: number;
  initialTipo?: string;
  initialSearch?: string;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const CFDI_TYPES = [
  { value: "all", label: "Todos" },
  { value: "PUE", label: "Ingreso" },
  { value: "PPD", label: "Egreso" },
  { value: "COMPLEMENTO_PAGO", label: "Pago" },
];

export function InvoicesListContent({
  invoices,
  pagination,
  profiles,
  metrics,
  initialProfileId,
  initialMes,
  initialAño,
  initialTipo,
  initialSearch,
}: InvoicesListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch || "");
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId || "all");
  const [selectedMes, setSelectedMes] = useState(initialMes || new Date().getMonth() + 1);
  const [selectedAño, setSelectedAño] = useState(initialAño || new Date().getFullYear());
  const [selectedTipo, setSelectedTipo] = useState(initialTipo || "all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedProfileId && selectedProfileId !== "all") params.set("profileId", selectedProfileId);
    if (selectedMes) params.set("mes", selectedMes.toString());
    if (selectedAño) params.set("año", selectedAño.toString());
    if (selectedTipo && selectedTipo !== "all") params.set("tipo", selectedTipo);
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`/dashboard/invoices?${params.toString()}`);
  }, [selectedProfileId, selectedMes, selectedAño, selectedTipo, search, router]);

  // Aplicar filtros automáticamente cuando cambien (excepto búsqueda)
  useEffect(() => {
    // Solo aplicar si no es la carga inicial
    if (
      selectedMes !== initialMes ||
      selectedAño !== initialAño ||
      selectedTipo !== initialTipo
    ) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMes, selectedAño, selectedTipo]); // Solo estos filtros se aplican automáticamente

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
    setSearch("");
    setSelectedMes(new Date().getMonth() + 1);
    setSelectedAño(new Date().getFullYear());
    setSelectedTipo("all");
    // El perfil no se resetea porque es un filtro principal
    const params = new URLSearchParams();
    if (selectedProfileId && selectedProfileId !== "all") params.set("profileId", selectedProfileId);
    params.set("mes", (new Date().getMonth() + 1).toString());
    params.set("año", new Date().getFullYear().toString());
    params.set("page", "1");
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const params = new URLSearchParams(searchParams.toString());
    if (profileId && profileId !== "all") {
      params.set("profileId", profileId);
    } else {
      params.delete("profileId");
    }
    params.set("page", "1");
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteError(null);
    setDeleteConfirmation("");
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open && !isDeleting) {
      setInvoiceToDelete(null);
      setDeleteError(null);
      setDeleteConfirmation("");
    }
  };

  const getDeleteErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        return "No tienes permisos para eliminar esta factura.";
      }
      if (error.status === 404) {
        return "La factura ya no existe o fue eliminada.";
      }
      if (error.status === 400) {
        return error.message || "No se puede eliminar esta factura.";
      }
      return error.message || "Error al eliminar la factura.";
    }
    return "Error inesperado al eliminar la factura. Por favor intenta nuevamente.";
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
      router.refresh();
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteKeyword = "ELIMINAR";
  const isDeleteBlocked =
    isDeleting || deleteConfirmation.trim() !== deleteKeyword;

  const handleExportPDF = async () => {
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
    
    // Calcular métricas para el resumen
    const totalFacturado = invoices.reduce((sum, inv) => {
      const total = typeof inv.total === "number" ? inv.total : parseFloat(inv.total) || 0;
      return sum + total;
    }, 0);
    
    // Las facturas PUE están pagadas automáticamente
    // Las facturas PPD están pagadas si tienen complementos de pago o están completamente pagadas
    const facturasPagadas = invoices.filter((inv) => {
      if (inv.tipo === "PUE") return true; // PUE siempre están pagadas
      if (inv.tipo === "PPD") {
        // Para PPD, considerar pagadas si tienen complemento_pago completo
        // Por ahora, todas las PPD se consideran pagadas si tienen complemento_pago
        return inv.complemento_pago !== null;
      }
      return false;
    });
    const totalPagado = facturasPagadas.reduce((sum, inv) => {
      const total = typeof inv.total === "number" ? inv.total : parseFloat(inv.total) || 0;
      return sum + total;
    }, 0);
    
    const pendientePorPagar = totalFacturado - totalPagado;

    await exportToPDF({
      tipo: "facturas",
      invoices,
      profileName: selectedProfile?.nombre || "Todos los perfiles",
      rfc: selectedProfile?.rfc || "",
      mes: selectedMes,
      año: selectedAño,
      metrics: {
        totalFacturado,
        totalPagado,
        totalCompras: 0,
        pendientePorPagar,
        diferencia: 0,
        totalFacturas: invoices.length,
        facturasPUE: invoices.filter((inv) => inv.tipo === "PUE").length,
        facturasPPD: invoices.filter((inv) => inv.tipo === "PPD").length,
      },
    });
  };

  const getTypeBadge = (tipo: string) => {
    const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      PUE: { label: "Ingreso", variant: "default" },
      PPD: { label: "Egreso", variant: "secondary" },
      COMPLEMENTO_PAGO: { label: "Pago", variant: "outline" },
    };
    const type = typeMap[tipo] || { label: tipo, variant: "outline" as const };
    return (
      <Badge variant={type.variant} className="text-xs">
        {type.label}
      </Badge>
    );
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.validacion?.valido) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          ✓ VÁLIDO
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTitle className="h-3 w-3" />
        ERROR
      </Badge>
    );
  };

  const validInvoices = invoices.filter((inv) => inv.validacion?.valido).length;
  const errorInvoices = invoices.filter((inv) => !inv.validacion?.valido).length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
          <p className="text-muted-foreground mt-2">
            Administra y monitorea el estado de todos tus CFDI emitidos y recibidos.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div data-tour="invoices-profile-selector">
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
          <Link href="/dashboard/invoices/upload">
            <Button data-tour="invoices-upload-button" className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Subir Facturas
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        validCount={validInvoices}
        errorCount={errorInvoices}
        totalIncome={metrics.totalFacturado}
      />

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por RFC, Nombre o UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
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
        <Select value={selectedTipo} onValueChange={setSelectedTipo}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Tipo CFDI: Todos" />
          </SelectTrigger>
          <SelectContent>
            {CFDI_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                Tipo CFDI: {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleClearFilters} 
          variant="outline"
          className="w-full md:w-auto"
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>

      {/* Invoices Table */}
      <div data-tour="invoices-table" className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead className="min-w-[200px]">UUID / FOLIO</TableHead>
                  <TableHead className="min-w-[150px]">FECHA</TableHead>
                  <TableHead className="min-w-[200px]">EMISOR</TableHead>
                  <TableHead className="min-w-[200px]">RECEPTOR</TableHead>
                  <TableHead className="min-w-[120px]">TOTAL</TableHead>
                  <TableHead className="min-w-[100px]">TIPO</TableHead>
                  <TableHead className="min-w-[100px]">ESTADO</TableHead>
                  <TableHead className="min-w-[120px] text-right">ACCIONES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="max-w-[200px] truncate" title={invoice.uuid}>
                          {invoice.uuid || `F-${invoice.id.slice(-4)}`}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(invoice.fecha)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm font-medium truncate" title={invoice.nombre_emisor}>
                            {invoice.nombre_emisor}
                          </p>
                          <p className="text-xs text-muted-foreground">{invoice.rfc_emisor}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm font-medium truncate" title={invoice.nombre_receptor}>
                            {invoice.nombre_receptor}
                          </p>
                          <p className="text-xs text-muted-foreground">{invoice.rfc_receptor}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>{getTypeBadge(invoice.tipo)}</TableCell>
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
                    <TableCell colSpan={8} className="py-8">
                      <EmptyState
                        icon={FileX}
                        title={
                          search
                            ? `No se encontraron facturas que coincidan con "${search}"`
                            : "No se encontraron facturas"
                        }
                        description={
                          search
                            ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                            : "Comienza subiendo archivos XML de facturas"
                        }
                        actionLabel={search ? undefined : "Subir Facturas"}
                        actionHref={search ? undefined : "/dashboard/invoices/upload"}
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
          <p className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
            {pagination.total} facturas
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
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <span className="px-2 text-muted-foreground">...</span>
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
              <p className="font-medium">
                {invoiceToDelete.nombre_emisor}
              </p>
              <p className="text-muted-foreground">
                {invoiceToDelete.concepto || "Sin concepto"}
              </p>
              <p className="text-muted-foreground mt-1">
                Total: {formatCurrency(invoiceToDelete.total)}
              </p>
              <p className="text-muted-foreground font-mono text-xs mt-1">
                UUID: {invoiceToDelete.uuid}
              </p>
            </div>
          )}
          {invoiceToDelete && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Para confirmar, escribe{" "}
                <span className="font-mono font-medium text-foreground">
                  {deleteKeyword}
                </span>
                .
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
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

