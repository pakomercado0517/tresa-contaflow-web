"use client";

import { useState } from "react";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSATDownloadStatus,
  triggerSATSync,
} from "@/lib/api/sat-descarga.client";
import type { Profile } from "@/lib/types/profiles";
import type { SATDownloadStatus } from "@/lib/types/sat-descarga";
import { FIELRegistrationDialog } from "./FIELRegistrationDialog";

interface SATProfilesTableProps {
  profiles: Profile[];
}

function formatSyncDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CredentialsBadge({ hasCredentials }: { hasCredentials: boolean }) {
  if (hasCredentials) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
        Registradas
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
      Sin registrar
    </Badge>
  );
}

function SyncStatusIndicator({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-sm text-emerald-400">Habilitada</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-gray-500" />
      <span className="text-sm text-muted-foreground">Deshabilitada</span>
    </div>
  );
}

function ProfileRow({
  profile,
  status,
  isLoadingStatus,
}: {
  profile: Profile;
  status: SATDownloadStatus | undefined;
  isLoadingStatus: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: () => triggerSATSync(profile.id),
    onSuccess: (data) => {
      if (data.errors.length > 0) {
        toast.error("Error en sincronización", {
          description: data.errors.join(", "),
        });
      } else {
        toast.success("Sincronización registrada", {
          description:
            "Se actualizó la fecha de sincronización. La descarga automática de CFDIs se habilitará próximamente.",
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["sat-download-status", profile.id],
      });
    },
    onError: (error: Error) => {
      toast.error("Error al sincronizar", { description: error.message });
    },
  });

  const hasCredentials = status?.has_credentials ?? false;
  const syncEnabled = status?.sync_enabled ?? false;

  return (
    <>
      <TableRow className="border-border/40 hover:bg-white/2">
        <TableCell>
          <div>
            <p className="font-medium">{profile.nombre}</p>
            <p className="text-sm text-muted-foreground font-mono">
              {profile.rfc}
            </p>
          </div>
        </TableCell>
        <TableCell>
          {isLoadingStatus ? (
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          ) : (
            <CredentialsBadge hasCredentials={hasCredentials} />
          )}
        </TableCell>
        <TableCell>
          {isLoadingStatus ? (
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          ) : (
            <SyncStatusIndicator enabled={syncEnabled} />
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {isLoadingStatus ? (
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          ) : (
            formatSyncDate(status?.last_sync_at ?? null)
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="border-border/60 hover:border-border"
            >
              <Key className="mr-1.5 h-3.5 w-3.5" />
              {hasCredentials ? "Actualizar FIEL" : "Configurar FIEL"}
            </Button>
            <Button
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={!hasCredentials || syncMutation.isPending}
              className="bg-[#00ff80] text-gray-900 hover:bg-[#00ff80]/90 disabled:opacity-40"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`}
              />
              Sincronizar
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <FIELRegistrationDialog
        profile={profile}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        hasExistingCredentials={hasCredentials}
      />
    </>
  );
}

export function SATProfilesTable({ profiles }: SATProfilesTableProps) {
  const statusQueries = useQueries({
    queries: profiles.map((profile) => ({
      queryKey: ["sat-download-status", profile.id],
      queryFn: () => getSATDownloadStatus(profile.id),
      staleTime: 30_000,
      retry: 1,
    })),
  });

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">
              Perfil
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Credenciales FIEL
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Sincronización
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Última sincronización
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No tienes perfiles registrados. Crea un perfil para configurar la descarga masiva.
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile, idx) => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                status={statusQueries[idx]?.data}
                isLoadingStatus={statusQueries[idx]?.isLoading ?? true}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
