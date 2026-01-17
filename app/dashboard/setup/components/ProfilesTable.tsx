"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { deleteProfile } from "@/lib/api/profiles.client";
import type { Profile } from "@/lib/types/profiles";
import type { Plan, SubscriptionStatus } from "@/lib/types/subscription";

interface ProfilesTableProps {
  profiles: Profile[];
  canCreate: boolean;
  remaining: number;
  plan: Plan;
  currentCount: number;
  subscriptionStatus: SubscriptionStatus;
}

interface SubscriptionStatusInfo {
  label: string;
  color: string;
}

// Función para obtener la información del estatus de suscripción
function getSubscriptionStatusInfo(status: SubscriptionStatus): SubscriptionStatusInfo {
  switch (status) {
    case "ACTIVE":
      return { label: "Vigente", color: "bg-green-500" };
    case "TRIALING":
      return { label: "En Prueba", color: "bg-blue-500" };
    case "PAST_DUE":
      return { label: "Pago Retrasado", color: "bg-yellow-500" };
    case "CANCELLED":
      return { label: "Cancelada", color: "bg-orange-500" };
    case "EXPIRED":
      return { label: "Expirada", color: "bg-red-500" };
    case "UNPAID":
      return { label: "Sin Pago", color: "bg-red-600" };
    default:
      return { label: "Desconocido", color: "bg-gray-500" };
  }
}

function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const statusInfo = getSubscriptionStatusInfo(status);

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
      <span className="text-sm">{statusInfo.label}</span>
    </div>
  );
}

function getDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "No tienes permisos para eliminar este perfil.";
    }
    if (error.status === 404) {
      return "El perfil ya no existe o fue eliminado.";
    }
    if (error.status === 409) {
      return "No se puede eliminar el perfil porque tiene datos asociados.";
    }
    return error.message || "No se pudo eliminar el perfil.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo eliminar el perfil. Intenta nuevamente.";
}

export function ProfilesTable({
  profiles,
  canCreate,
  remaining,
  plan,
  currentCount,
  subscriptionStatus,
}: ProfilesTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 4;

  // Filtrar perfiles por búsqueda
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;

    const query = searchQuery.toLowerCase();
    return profiles.filter(
      (profile) =>
        profile.nombre.toLowerCase().includes(query) ||
        profile.rfc.toLowerCase().includes(query)
    );
  }, [profiles, searchQuery]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log("Exportar perfiles");
  };

  const handleDeleteClick = (profile: Profile) => {
    setProfileToDelete(profile);
    setDeleteError(null);
    setDeleteConfirmation("");
  };

  const handleEditClick = (profileId?: string) => {
    if (!profileId) return;
    router.push(`/dashboard/setup/profiles/${profileId}`);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open && !isDeleting) {
      setProfileToDelete(null);
      setDeleteError(null);
      setDeleteConfirmation("");
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

  const deleteKeyword = profileToDelete ? `ELIMINAR ${profileToDelete.rfc}` : "";
  const isDeleteBlocked =
    isDeleting || deleteConfirmation.trim() !== deleteKeyword;

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tienes perfiles aún</h3>
        <p className="text-muted-foreground text-center mb-4">
          Crea tu primer perfil RFC para comenzar a gestionar tus facturas
        </p>
        <Link href="/dashboard/setup/profiles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Perfil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ENTIDAD / RFC</TableHead>
              <TableHead>TIPO DE PERSONA</TableHead>
              <TableHead>ESTATUS DE SUSCRIPCIÓN</TableHead>
              <TableHead className="text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProfiles.map((profile) => {
              return (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {profile.tipo_persona === "FISICA" ? (
                        <User className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{profile.nombre}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {profile.rfc}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        profile.tipo_persona === "FISICA"
                          ? "border-purple-500/50 text-purple-600 dark:text-purple-400"
                          : "border-purple-500/50 text-purple-600 dark:text-purple-400"
                      }
                    >
                      {profile.tipo_persona === "FISICA"
                        ? "Persona Física"
                        : "Persona Moral"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SubscriptionStatusBadge status={subscriptionStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(profile.id)}
                        disabled={!profile.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(profile)}
                        disabled={isDeleting}
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
        <p className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProfiles.length)} de{" "}
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
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? "" : ""}
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
              Esta acción eliminará el perfil seleccionado y no se puede deshacer. También
              se borrarán todas las facturas subidas relacionadas a este perfil o RFC.
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
              onClick={() => handleCloseDialog(false)}
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

