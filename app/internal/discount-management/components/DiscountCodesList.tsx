"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  activateDiscountCodeClient,
  deactivateDiscountCodeClient,
} from "@/lib/api/discounts.client";
import type { DiscountCode } from "@/lib/types/discounts";
import { Loader2, Power, PowerOff } from "lucide-react";

interface DiscountCodesListProps {
  codes: DiscountCode[];
  onUpdate: () => void;
}

export function DiscountCodesList({ codes, onUpdate }: DiscountCodesListProps) {
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const handleToggleActive = async (code: DiscountCode) => {
    const codeId = code.id;
    setUpdatingIds((prev) => new Set(prev).add(codeId));

    try {
      if (code.active) {
        await deactivateDiscountCodeClient(codeId);
      } else {
        await activateDiscountCodeClient(codeId);
      }
      onUpdate();
    } catch (error) {
      console.error("Error al actualizar código:", error);
      alert(
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Error al actualizar el código"
      );
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(codeId);
        return next;
      });
    }
  };

  if (codes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay códigos de descuento creados</p>
        <p className="text-sm mt-2">Crea tu primer código usando el formulario</p>
      </div>
    );
  }

  const getStatusBadge = (code: DiscountCode) => {
    if (code.status === "EXPIRED") {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    if (code.status === "INACTIVE" || !code.active) {
      return <Badge variant="secondary">Inactivo</Badge>;
    }
    return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Activo</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTrialDays = (trialDays: number | null) => {
    if (trialDays === null) return "Default plan";
    if (trialDays === 0) return "Sin trial";
    return `${trialDays} días`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Uso</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((code) => {
              const isUpdating = updatingIds.has(code.id);
              const usageText =
                code.maxRedemptions !== null
                  ? `${code.timesRedeemed} / ${code.maxRedemptions}`
                  : `${code.timesRedeemed} (ilimitado)`;

              return (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-medium">{code.code}</TableCell>
                  <TableCell>{getStatusBadge(code)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {usageText}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTrialDays(code.trialDays ?? null)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(code.expiresAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(code)}
                      disabled={isUpdating || code.status === "EXPIRED"}
                      className="gap-2"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : code.active ? (
                        <>
                          <PowerOff className="h-4 w-4" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4" />
                          Activar
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {codes.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Total: {codes.length} código{codes.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
