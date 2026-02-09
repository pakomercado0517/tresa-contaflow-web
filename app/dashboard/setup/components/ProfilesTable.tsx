'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Building2,
  User,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApiError } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';
import { deleteProfile } from '@/lib/api/profiles.client';
import { getRegimenesFiscalesClient } from '@/lib/api/sat.client';
import { exportProfilesToPDF, type ProfileStats } from '@/lib/utils/pdf-export';
import { exportProfilesToExcel } from '@/lib/excel';
import { hasFeatureAccess } from '@/lib/hooks/useSubscription';
import type { Profile } from '@/lib/types/profiles';
import type { Plan, Subscription, SubscriptionStatus } from '@/lib/types/subscription';
import type { Invoice } from '@/lib/types/invoices';
import type { Expense } from '@/lib/types/expenses';

interface ProfilesTableProps {
  profiles: Profile[];
  canCreate: boolean;
  remaining: number;
  plan: Plan;
  currentCount: number;
  subscriptionStatus: SubscriptionStatus;
  subscription?: Subscription | null;
}

function RegimenFiscalCell({
  regimenesFiscales,
  descripcionMap,
}: {
  regimenesFiscales: string[];
  descripcionMap: Record<string, string>;
}) {
  const MAX_VISIBLE = 3;
  const visible = regimenesFiscales.slice(0, MAX_VISIBLE);
  const remaining = regimenesFiscales.length - MAX_VISIBLE;

  const getTooltip = (clave: string) => {
    const desc = descripcionMap[clave];
    return desc ? `${clave} - ${desc}` : clave;
  };

  if (!regimenesFiscales.length) {
    return (
      <span className="text-muted-foreground text-sm">Sin definir</span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-[200px]">
      {visible.map((clave) => (
        <Badge
          key={clave}
          variant="outline"
          className="font-mono text-xs border-primary/30 text-foreground shrink-0 cursor-help"
          title={getTooltip(clave)}
        >
          {clave}
        </Badge>
      ))}
      {remaining > 0 && (
        <span
          className="text-muted-foreground text-xs shrink-0"
          title={regimenesFiscales
            .slice(MAX_VISIBLE)
            .map((c) => getTooltip(c))
            .join("\n")}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

function getDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'No tienes permisos para eliminar este perfil.';
    }
    if (error.status === 404) {
      return 'El perfil ya no existe o fue eliminado.';
    }
    if (error.status === 409) {
      return 'No se puede eliminar el perfil porque tiene datos asociados.';
    }
    return error.message || 'No se pudo eliminar el perfil.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo eliminar el perfil. Intenta nuevamente.';
}

export function ProfilesTable({
  profiles,
  subscription,
}: ProfilesTableProps) {
  const router = useRouter();
  const canExportExcel = hasFeatureAccess(subscription ?? null, 'excel_export');

  const { data: regimenesData } = useQuery({
    queryKey: ['regimenes-fiscales'],
    queryFn: () => getRegimenesFiscalesClient(),
  });
  const descripcionMap = useMemo(() => {
    const items = regimenesData?.data ?? [];
    return Object.fromEntries(items.map((r) => [r.clave, r.descripcion]));
  }, [regimenesData]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 4;

  // Filtrar perfiles por búsqueda
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;

    const query = searchQuery.toLowerCase();
    return profiles.filter(
      (profile) =>
        profile.nombre.toLowerCase().includes(query) || profile.rfc.toLowerCase().includes(query)
    );
  }, [profiles, searchQuery]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const calculateProfileStats = (
    invoices: Invoice[],
    expenses: Expense[],
    profileId: string
  ): ProfileStats => {
    const profileInvoices = invoices.filter((inv) => inv.profile_id === profileId);
    const profileExpenses = expenses.filter((exp) => exp.profile_id === profileId);

    const totalInvoiced = profileInvoices.reduce((sum, inv) => {
      const total = typeof inv.total === 'number' ? inv.total : parseFloat(inv.total) || 0;
      return sum + total;
    }, 0);

    const totalSpent = profileExpenses.reduce((sum, exp) => {
      const total = typeof exp.total === 'number' ? exp.total : parseFloat(exp.total) || 0;
      return sum + total;
    }, 0);

    const invoiceDates = profileInvoices
      .map((inv) => inv.fecha)
      .filter((fecha): fecha is string => Boolean(fecha))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const expenseDates = profileExpenses
      .map((exp) => exp.fecha)
      .filter((fecha): fecha is string => Boolean(fecha))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return {
      profileId,
      totalInvoices: profileInvoices.length,
      totalExpenses: profileExpenses.length,
      totalInvoiced,
      totalSpent,
      firstInvoiceDate: invoiceDates.length > 0 ? invoiceDates[0] : null,
      lastInvoiceDate: invoiceDates.length > 0 ? invoiceDates[invoiceDates.length - 1] : null,
      firstExpenseDate: expenseDates.length > 0 ? expenseDates[0] : null,
      lastExpenseDate: expenseDates.length > 0 ? expenseDates[expenseDates.length - 1] : null,
    };
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Obtener todas las facturas y gastos (sin límite)
      const [invoicesResponse, expensesResponse] = await Promise.all([
        apiClient<{ data: Invoice[] }>('/api/invoices?limit=10000', {
          requireAuth: true,
        }),
        apiClient<{ data: Expense[] }>('/api/expenses?limit=10000', {
          requireAuth: true,
        }),
      ]);

      const invoices = invoicesResponse.data || [];
      const expenses = expensesResponse.data || [];

      // Calcular estadísticas por perfil
      const profilesStats: ProfileStats[] = profiles.map((profile) =>
        calculateProfileStats(invoices, expenses, profile.id)
      );

      await exportProfilesToPDF({
        profiles,
        profilesStats,
      });
    } catch (error) {
      logger.error('Error al exportar perfiles', error);
      if (error instanceof ApiError) {
        alert(`Error al generar el PDF: ${error.message}`);
      } else {
        alert('Error al generar el PDF. Por favor intenta nuevamente.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const [invoicesResponse, expensesResponse] = await Promise.all([
        apiClient<{ data: Invoice[] }>('/api/invoices?limit=10000', {
          requireAuth: true,
        }),
        apiClient<{ data: Expense[] }>('/api/expenses?limit=10000', {
          requireAuth: true,
        }),
      ]);
      const invoices = invoicesResponse.data || [];
      const expenses = expensesResponse.data || [];
      const profilesStats: ProfileStats[] = profiles.map((profile) =>
        calculateProfileStats(invoices, expenses, profile.id)
      );
      await exportProfilesToExcel({
        profiles,
        profilesStats,
      });
    } catch (error) {
      logger.error('Error al exportar perfiles a Excel', error);
      if (error instanceof ApiError) {
        alert(`Error al generar el Excel: ${error.message}`);
      } else {
        alert('Error al generar el Excel. Por favor intenta nuevamente.');
      }
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDeleteClick = (profile: Profile) => {
    setProfileToDelete(profile);
    setDeleteError(null);
    setDeleteConfirmation('');
  };

  const handleEditClick = (profileId?: string) => {
    if (!profileId) return;
    router.push(`/dashboard/setup/profiles/${profileId}`);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open && !isDeleting) {
      setProfileToDelete(null);
      setDeleteError(null);
      setDeleteConfirmation('');
    }
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteProfile(profileToDelete.id);
      setProfileToDelete(null);
      router.refresh();
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteKeyword = profileToDelete ? `ELIMINAR ${profileToDelete.rfc}` : '';
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== deleteKeyword;

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-12">
        <Building2 className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No tienes perfiles aún</h3>
        <p className="text-muted-foreground mb-4 text-center">
          Crea tu primer perfil RFC para comenzar a gestionar tus facturas
        </p>
        <Link href="/dashboard/setup/profiles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Primer Perfil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por Razón Social o RFC..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset a primera página al buscar
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={!canExportExcel || isExportingExcel}
            title={!canExportExcel ? 'Disponible en plan Pro' : undefined}
          >
            {isExportingExcel ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ENTIDAD / RFC</TableHead>
              <TableHead>TIPO DE PERSONA</TableHead>
              <TableHead>RÉGIMEN FISCAL</TableHead>
              <TableHead className="text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProfiles.map((profile) => {
              return (
                <TableRow key={profile.id} className={profile.frozen ? 'opacity-60' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {profile.tipo_persona === 'FISICA' ? (
                        <User className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <Building2 className="text-muted-foreground h-5 w-5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{profile.nombre}</p>
                          {profile.frozen && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              🔒 Congelado
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground font-mono text-sm">{profile.rfc}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        profile.tipo_persona === 'FISICA'
                          ? 'border-purple-500/50 text-purple-600 dark:text-purple-400'
                          : 'border-blue-500/50 text-blue-600 dark:text-blue-400'
                      }
                    >
                      {profile.tipo_persona === 'FISICA' ? 'Persona Física' : 'Persona Moral'}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <RegimenFiscalCell
                      regimenesFiscales={profile.regimenes_fiscales ?? []}
                      descripcionMap={descripcionMap}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(profile.id)}
                        disabled={!profile.id || profile.frozen}
                        title={profile.frozen ? 'No puedes editar un perfil congelado' : ''}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(profile)}
                        disabled={isDeleting || profile.frozen}
                        title={profile.frozen ? 'No puedes eliminar un perfil congelado' : ''}
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProfiles.length)} de{' '}
          {filteredProfiles.length} resultados
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (currentPage === 1) {
              pageNum = i + 1;
            } else if (currentPage === totalPages) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = currentPage - 1 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? '' : ''}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!profileToDelete} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar perfil</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el perfil seleccionado y no se puede deshacer. También se
              borrarán todas las facturas subidas relacionadas a este perfil o RFC.
            </DialogDescription>
          </DialogHeader>
          {profileToDelete && (
            <div className="rounded-lg border p-4 text-sm">
              <p className="font-medium">{profileToDelete.nombre}</p>
              <p className="text-muted-foreground font-mono">{profileToDelete.rfc}</p>
            </div>
          )}
          {profileToDelete && (
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
              onClick={() => handleCloseDialog(false)}
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
