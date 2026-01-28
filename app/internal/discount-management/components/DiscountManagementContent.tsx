'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateDiscountCodeForm } from './CreateDiscountCodeForm';
import { DiscountCodesList } from './DiscountCodesList';
import type { DiscountCode } from '@/lib/types/discounts';
import { getDiscountCodesClient } from '@/lib/api/discounts.client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { logoutAction } from '@/app/dashboard/setup/actions';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';

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
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message: string }).message || 'Error al cargar códigos');
      } else {
        setError('Error al cargar códigos de descuento');
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

  const handleLogout = async () => {
    // Limpiar localStorage antes de cerrar sesión
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tour:onboarding');
    }

    // Llamar a la Server Action que elimina cookies y redirige
    await logoutAction();
  };

  return (
    <div className="from-background via-primary/5 to-primary/10 min-h-screen bg-gradient-to-br">
      {/* Header con navegación */}
      <div className="bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <ShieldCheck className="text-primary h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold">Panel Admin</h2>
                <p className="text-muted-foreground text-xs">Gestión de Descuentos</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Gestión de Códigos de Descuento</h1>
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
                  ? `${codes.length} código${codes.length !== 1 ? 's' : ''} encontrado${codes.length !== 1 ? 's' : ''}`
                  : 'No hay códigos de descuento'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorState message={error} onRetry={loadCodes} />
              ) : (
                <DiscountCodesList codes={codes} onUpdate={handleCodeUpdated} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
