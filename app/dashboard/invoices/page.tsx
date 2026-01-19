import { Suspense } from "react";
import { getInvoices } from "@/lib/api/invoices";
import { getProfiles } from "@/lib/api/profiles";
import { getMetrics } from "@/lib/api/invoices";
import { InvoicesListContent } from "./components/InvoicesListContent";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import type { ServerApiError } from "@/lib/api/server-client";

interface InvoicesPageProps {
  searchParams: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
    tipo?: string;
    page?: string;
    search?: string;
  }>;
}

async function InvoicesContent({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const profileId = params?.profileId && params.profileId !== "all" ? params.profileId : undefined;
  const mes = params?.mes ? Number(params.mes) : new Date().getMonth() + 1;
  const año = params?.año ? Number(params.año) : new Date().getFullYear();
  const tipo = params?.tipo && params.tipo !== "all" ? params.tipo : undefined;
  const page = params?.page ? Number(params.page) : 1;
  const search = params?.search;

  let invoices;
  let profiles;
  let metrics;
  let error: ServerApiError | null = null;

  try {
    const results = await Promise.all([
      getInvoices({
        profileId,
        mes,
        año,
        tipo,
        page,
        limit: 10,
        search,
      }),
      getProfiles(),
      getMetrics(profileId, mes, año),
    ]);
    
    invoices = results[0];
    profiles = results[1];
    metrics = results[2];
  } catch (err) {
    const apiError = err as ServerApiError;
    
    // Si es un error de autenticación, el serverApiClient ya redirige
    // Solo manejamos otros errores aquí
    if (apiError.status === 401) {
      throw err; // Dejar que el redirect se maneje
    }

    error = apiError;
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar las facturas"
        message={
          error.message ||
          "No se pudieron cargar las facturas. Por favor verifica tu conexión e intenta nuevamente."
        }
      />
    );
  }

  return (
    <InvoicesListContent
      invoices={invoices!.data}
      pagination={invoices!.pagination}
      profiles={profiles!.data}
      metrics={metrics!.metrics}
      initialProfileId={profileId}
      initialMes={mes}
      initialAño={año}
      initialTipo={tipo}
      initialSearch={search}
    />
  );
}

export default async function InvoicesPage(props: InvoicesPageProps) {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <Suspense fallback={<LoadingSpinner message="Cargando facturas..." fullScreen />}>
        <InvoicesContent {...props} />
      </Suspense>
    </main>
  );
}
