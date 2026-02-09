import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function ReportePreviewLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner message="Cargando reporte..." />
    </div>
  );
}
