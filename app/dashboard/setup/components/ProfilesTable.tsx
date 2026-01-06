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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Plan, SubscriptionStatus } from "@/lib/types/subscription";

interface Profile {
  id: string;
  nombre: string;
  rfc: string;
  tipo_persona: "FISICA" | "MORAL";
  regimen_fiscal: string | null;
}

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

  const handleDelete = (profileId: string) => {
    // TODO: Implementar eliminación con confirmación
    if (confirm("¿Estás seguro de que quieres eliminar este perfil?")) {
      console.log("Eliminar perfil:", profileId);
    }
  };

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
                        onClick={() =>
                          router.push(`/dashboard/setup/profiles/${profile.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(profile.id)}
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
    </div>
  );
}

