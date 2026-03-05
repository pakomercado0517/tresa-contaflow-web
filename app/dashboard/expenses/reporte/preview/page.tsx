import "./report-pdf.css";
import { getExpenses } from "@/lib/api/expenses";
import { getProfiles } from "@/lib/api/profiles";
import { getRegimenesFiscales } from "@/lib/api/sat";
import { getCurrentUser } from "@/lib/api/auth.server";
import { ExpensesReportPreviewContent } from "./components/ExpensesReportPreviewContent";
import type { ReporteGastosData, FilaGastoReporte } from "./components/ReporteGastosTemplate";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const dynamic = "force-dynamic";

interface PreviewPageProps {
  searchParams?: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
    regimen_fiscal?: string;
    search?: string;
  }>;
}

function toNumber(value: number | string): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function shortUuid(uuid: string | null): string {
  if (!uuid) return "—";
  return uuid.length > 16 ? `${uuid.slice(0, 8)}-${uuid.slice(-6)}` : uuid;
}

export default async function ExpensesReportePreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  const currentDate = new Date();
  const profileId = params?.profileId && params.profileId !== "all" ? params.profileId : undefined;
  const mesParam = params?.mes;
  const añoParam = params?.año;
  const regimenFiscal =
    params?.regimen_fiscal && params.regimen_fiscal !== "all" ? params.regimen_fiscal : undefined;
  const search = params?.search ?? undefined;

  const mes = mesParam ? Math.min(12, Math.max(1, toNumber(mesParam))) : currentDate.getMonth() + 1;
  const año = añoParam
    ? Math.min(2100, Math.max(2000, toNumber(añoParam)))
    : currentDate.getFullYear();

  const [profilesRes, expensesRes, regimenesCatalog, currentUser] = await Promise.all([
    getProfiles(),
    getExpenses({
      profileId,
      mes,
      año,
      regimen_fiscal: regimenFiscal,
      limit: 1000,
      page: 1,
      search,
    }),
    getRegimenesFiscales(),
    getCurrentUser(),
  ]);

  const profiles = profilesRes.data ?? [];
  const expenses = expensesRes.data ?? [];
  const activeProfile = profileId
    ? (profiles.find((p) => p.id === profileId) ?? null)
    : null;
  const profileName = activeProfile?.nombre ?? "Todos los perfiles";
  const rfc = activeProfile?.rfc ?? "";

  const catalogByClave = new Map(
    (regimenesCatalog?.data ?? []).map((r) => [r.clave, r.descripcion])
  );
  const regimenFiscalLabel = regimenFiscal
    ? catalogByClave.get(regimenFiscal) ?? `Régimen ${regimenFiscal}`
    : "Todos";

  const now = new Date();
  const generatedDate = now.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const generatedTime = now.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const reportId = `#GASTOS-${profileId?.slice(0, 8) ?? "all"}-${mes}-${año}-${now.getTime().toString(36).toUpperCase().slice(-6)}`;

  const totalEgresos = expenses.reduce((s, exp) => s + toNumber(exp.total), 0);
  const totalIva = expenses.reduce(
    (s, exp) => s + toNumber(exp.iva ?? exp.iva_amount ?? 0),
    0
  );
  const totalRetencionesIva = expenses.reduce(
    (s, exp) => s + toNumber(exp.retencion_iva_amount ?? 0),
    0
  );
  const totalRetencionesIsr = expenses.reduce(
    (s, exp) => s + toNumber(exp.retencion_isr_amount ?? 0),
    0
  );

  const algunaInvalida = expenses.some((exp) => !exp.validacion?.valido);
  const estadoCfdi = algunaInvalida ? "Vigentes y con errores" : "Vigentes";

  const filas: FilaGastoReporte[] = expenses.map((exp) => ({
    fecha: exp.fecha,
    folio: exp.uuid?.slice(0, 8) ?? exp.id?.slice(0, 8) ?? "—",
    uuidCorto: exp.uuid ? shortUuid(exp.uuid) : undefined,
    rfcEmisor: exp.rfc_emisor ?? "—",
    subtotal: toNumber(exp.subtotal),
    impuestos: toNumber(exp.iva ?? exp.iva_amount ?? 0),
    total: toNumber(exp.total),
  }));

  const reportData: ReporteGastosData = {
    profileName,
    rfc,
    reportId,
    generatedDate,
    generatedTime,
    mes,
    año,
    periodoLabel: `${MESES[mes - 1]} ${año}`,
    regimenFiscalLabel,
    estadoCfdi,
    totalEgresos,
    totalIva,
    totalRetencionesIva,
    totalRetencionesIsr,
    filas,
    logoUrl: currentUser?.user?.logo_url ?? null,
    nombreComercial: currentUser?.user?.nombre_comercial ?? null,
  };

  return (
    <div className="py-6">
      <ExpensesReportPreviewContent data={reportData} />
    </div>
  );
}
