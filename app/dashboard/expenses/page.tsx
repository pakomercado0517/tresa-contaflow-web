import { Suspense } from "react";
import { getExpenses } from "@/lib/api/expenses";
import { getProfiles } from "@/lib/api/profiles";
import { ExpensesListContent } from "./components/ExpensesListContent";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import type { ServerApiError } from "@/lib/api/server-client";

interface ExpensesPageProps {
  searchParams: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
    categoria?: string;
    page?: string;
    search?: string;
  }>;
}

async function ExpensesContent({ searchParams }: ExpensesPageProps) {
  const params = await searchParams;
  const profileId = params?.profileId && params.profileId !== "all" ? params.profileId : undefined;
  const mes = params?.mes ? Number(params.mes) : new Date().getMonth() + 1;
  const año = params?.año ? Number(params.año) : new Date().getFullYear();
  const categoria = params?.categoria && params.categoria !== "all" ? params.categoria : undefined;
  const page = params?.page ? Number(params.page) : 1;
  const search = params?.search;

  let expenses;
  let profiles;
  let error: ServerApiError | null = null;

  try {
    const results = await Promise.all([
      getExpenses({
        profileId,
        mes,
        año,
        categoria,
        page,
        limit: 20,
        search,
      }),
      getProfiles(),
    ]);
    
    expenses = results[0];
    profiles = results[1];
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
        title="Error al cargar los gastos"
        message={
          error.message ||
          "No se pudieron cargar los gastos. Por favor verifica tu conexión e intenta nuevamente."
        }
      />
    );
  }

  return (
    <ExpensesListContent
      expenses={expenses!.data}
      pagination={expenses!.pagination}
      profiles={profiles!.data}
      initialProfileId={profileId}
      initialMes={mes}
      initialAño={año}
      initialCategoria={params?.categoria || "all"}
      initialSearch={search}
    />
  );
}

export default async function ExpensesPage(props: ExpensesPageProps) {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <Suspense fallback={<LoadingSpinner message="Cargando gastos..." fullScreen />}>
        <ExpensesContent {...props} />
      </Suspense>
    </main>
  );
}

