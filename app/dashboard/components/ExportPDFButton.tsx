"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription, hasFeatureAccess } from "@/lib/hooks/useSubscription";

interface ExportPDFButtonProps {
  profileId?: string;
  mes: number;
  año: number;
}

/**
 * Navega a la vista previa del reporte mensual, donde el usuario puede
 * descargar PDF o imprimir. Solo se muestra si el plan tiene acceso a exportación PDF.
 */
export function ExportPDFButton({
  profileId,
  mes,
  año,
}: ExportPDFButtonProps) {
  const { subscription } = useSubscription();
  const canExportPDF = hasFeatureAccess(subscription, "pdf_export");

  if (!canExportPDF) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("mes", mes.toString());
  params.set("año", año.toString());
  if (profileId) params.set("profileId", profileId);
  const href = `/dashboard/reporte/preview?${params.toString()}`;

  return (
    <Button
      variant="outline"
      className="border-primary text-primary hover:bg-primary/10"
      asChild
    >
      <Link href={href}>
        <FileText className="mr-2 h-4 w-4" />
        Ver reporte PDF
      </Link>
    </Button>
  );
}
