"use client";

import { Construction } from "lucide-react";
import type { Profile } from "@/lib/types/profiles";
import { SATProfilesTable } from "./sat-download/SATProfilesTable";
import { SATSyncInfoCard } from "./sat-download/SATSyncInfoCard";

interface SATDownloadContentProps {
  profiles: Profile[];
}

export function SATDownloadContent({ profiles }: SATDownloadContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Descarga Masiva SAT</h2>
        <p className="text-muted-foreground mt-2">
          Registra las credenciales FIEL (e.firma) de tus perfiles para
          sincronizar automáticamente los CFDIs desde el SAT.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
        <Construction className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-300">
            Funcionalidad en desarrollo
          </p>
          <p className="text-sm leading-relaxed text-amber-300/70">
            Puedes registrar tus credenciales FIEL desde ahora. La descarga
            automática de CFDIs desde el SAT se habilitará próximamente. El
            botón &quot;Sincronizar&quot; actualizará la fecha de
            sincronización pero aún no descarga comprobantes.
          </p>
        </div>
      </div>

      <SATProfilesTable profiles={profiles} />

      <SATSyncInfoCard />
    </div>
  );
}
