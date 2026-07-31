'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateDiscountCodeForm } from './CreateDiscountCodeForm';
import { DiscountCodesList } from './DiscountCodesList';
import { getDiscountCodesClient } from '@/lib/api/discounts.client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { startDiscountAdminLogout } from '@/lib/auth/client-logout';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DISCOUNT_CODES_QUERY_KEY = ['discount-codes']

export function DiscountManagementContent() {
  const queryClient = useQueryClient()
  const { data: codes = [], isPending, isError, error, refetch} = useQuery({
    queryKey: DISCOUNT_CODES_QUERY_KEY,
    queryFn: async () => {
      const response = await getDiscountCodesClient()
      return response.data
    }
  })

  const handleCodeCreated = () => {
    queryClient.invalidateQueries({queryKey: DISCOUNT_CODES_QUERY_KEY})
  };

  const handleCodeUpdated = () => {
    queryClient.invalidateQueries({queryKey: DISCOUNT_CODES_QUERY_KEY})
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
                onClick={startDiscountAdminLogout}
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
              {isPending ? (
                <LoadingSpinner />
              ) : isError ? (
                <ErrorState message={error instanceof Error ? error.message : 'Error al cargar códigos de descuento'} onRetry={() => refetch()} />
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
