"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateDiscountCodeForm } from "./CreateDiscountCodeForm";
import { DiscountCodesList } from "./DiscountCodesList";
import type { DiscountCode } from "@/lib/types/discounts";
import { getDiscountCodesClient } from "@/lib/api/discounts.client";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";

export function DiscountManagementContent() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCodes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getDiscountCodesClient();
      setCodes(response.data);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message || "Error al cargar códigos");
      } else {
        setError("Error al cargar códigos de descuento");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, [refreshKey]);

  const handleCodeCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCodeUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Códigos de Descuento</h1>
        <p className="text-muted-foreground">
          Crea y gestiona códigos de descuento para promociones y campañas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Código</CardTitle>
            <CardDescription>
              Completa el formulario para crear un nuevo código de descuento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateDiscountCodeForm onSuccess={handleCodeCreated} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Códigos Existentes</CardTitle>
            <CardDescription>
              {codes.length > 0
                ? `${codes.length} código${codes.length !== 1 ? "s" : ""} encontrado${codes.length !== 1 ? "s" : ""}`
                : "No hay códigos de descuento"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorState message={error} onRetry={loadCodes} />
            ) : (
              <DiscountCodesList
                codes={codes}
                onUpdate={handleCodeUpdated}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
