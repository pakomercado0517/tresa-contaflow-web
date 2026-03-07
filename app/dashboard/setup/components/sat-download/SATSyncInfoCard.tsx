import { Info } from "lucide-react";

export function SATSyncInfoCard() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3.5">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-blue-300">
          Información de Sincronización
        </p>
        <p className="text-sm leading-relaxed text-blue-300/70">
          La sincronización automática se ejecuta cada noche a las 3:00 AM para
          todos los perfiles con credenciales FIEL vigentes. También puedes
          disparar una sincronización manual en cualquier momento.
        </p>
      </div>
    </div>
  );
}
