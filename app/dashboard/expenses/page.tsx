import { getExpenses } from "@/lib/api/expenses";
import { getProfiles } from "@/lib/api/profiles";
import { getMetrics } from "@/lib/api/invoices";
import { ExpensesListContent } from "./components/ExpensesListContent";

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

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams;
  const profileId = params?.profileId && params.profileId !== "all" ? params.profileId : undefined;
  const mes = params?.mes ? Number(params.mes) : new Date().getMonth() + 1;
  const año = params?.año ? Number(params.año) : new Date().getFullYear();
  const categoria = params?.categoria && params.categoria !== "all" ? params.categoria : undefined;
  const page = params?.page ? Number(params.page) : 1;
  const search = params?.search;

  const [expenses, profiles, metrics] = await Promise.all([
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
    getMetrics(profileId, mes, año),
  ]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <ExpensesListContent
        expenses={expenses.data}
        pagination={expenses.pagination}
        profiles={profiles.data}
        metrics={metrics.metrics}
        initialProfileId={profileId}
        initialMes={mes}
        initialAño={año}
        initialCategoria={params?.categoria || "all"}
        initialSearch={search}
      />
    </main>
  );
}

