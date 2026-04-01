import "./report-pdf.css";
import { getInvoices } from "@/lib/api/invoices";
import { getProfiles } from "@/lib/api/profiles";
import { getRegimenesFiscales } from "@/lib/api/sat";
import { getCurrentUser } from "@/lib/api/auth.server";
import { InvoicesReportPreviewContent } from "./components/InvoicesReportPreviewContent";
import type { ReporteFacturasData, FilaFacturaReporte } from "./components/ReporteFacturasTemplate";
import { getCurrentMonthYearInAppTimezone } from "@/lib/utils/app-calendar";

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

function shortUuid(uuid: string): string {
  if (!uuid) return "—";
  return uuid.length > 16 ? `${uuid.slice(0, 8)}-${uuid.slice(-6)}` : uuid;
}

export default async function InvoicesReportePreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  const { mes: defaultMes, año: defaultAño } = getCurrentMonthYearInAppTimezone();
  const profileId = params?.profileId && params.profileId !== "all" ? params.profileId : undefined;
  const mesParam = params?.mes;
  const añoParam = params?.año;
  const regimenFiscal = params?.regimen_fiscal && params.regimen_fiscal !== "all"
    ? params.regimen_fiscal
    : undefined;
  const search = params?.search ?? undefined;

  const mes = mesParam ? Math.min(12, Math.max(1, toNumber(mesParam))) : defaultMes;
  const año = añoParam
    ? Math.min(2100, Math.max(2000, toNumber(añoParam)))
    : defaultAño;

  const [profilesRes, invoicesRes, regimenesCatalog, currentUser] = await Promise.all([
    getProfiles(),
    getInvoices({
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
  const invoices = invoicesRes.data ?? [];
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

  const reportId = `#INV-${profileId?.slice(0, 8) ?? "all"}-${mes}-${año}-${now.getTime().toString(36).toUpperCase().slice(-6)}`;

  const totalIngresos = invoices.reduce((s, inv) => s + toNumber(inv.total), 0);
  const totalIvaTrasladado = invoices.reduce(
    (s, inv) => s + toNumber(inv.iva ?? inv.iva_amount ?? 0),
    0
  );
  const totalRetencionesIva = invoices.reduce(
    (s, inv) => s + toNumber(inv.retencion_iva_amount ?? 0),
    0
  );
  const totalRetencionesIsr = invoices.reduce(
    (s, inv) => s + toNumber(inv.retencion_isr_amount ?? 0),
    0
  );

  const todasValidas = invoices.length > 0 && invoices.every((inv) => inv.validacion?.valido);
  const algunaInvalida = invoices.some((inv) => !inv.validacion?.valido);
  const estadoCfdi =
    algunaInvalida && !todasValidas
      ? "Vigentes y con errores"
      : "Vigentes";

  const filas: FilaFacturaReporte[] = invoices.map((inv) => ({
    fecha: inv.fecha,
    folio: inv.uuid?.slice(0, 8) ?? inv.id?.slice(0, 8) ?? "—",
    uuidCorto: inv.uuid ? shortUuid(inv.uuid) : undefined,
    rfcReceptor: inv.rfc_receptor ?? "—",
    subtotal: toNumber(inv.subtotal),
    impuestos: toNumber(inv.iva ?? inv.iva_amount ?? 0),
    total: toNumber(inv.total),
  }));

  const reportData: ReporteFacturasData = {
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
    totalIngresos,
    totalIvaTrasladado,
    totalRetencionesIva,
    totalRetencionesIsr,
    filas,
    logoUrl: currentUser?.user?.logo_url ?? null,
    nombreComercial: currentUser?.user?.nombre_comercial ?? null,
  };

  return (
    <div className="py-6">
      <InvoicesReportPreviewContent data={reportData} />
    </div>
  );
}
