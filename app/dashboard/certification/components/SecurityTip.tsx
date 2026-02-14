import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function SecurityTip() {
  return (
    <div className="flex items-start gap-4 rounded-lg border-2 border-yellow-500/50 bg-yellow-500/5 p-4">
      <div className="mt-0.5 shrink-0">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
      </div>
      <div className="flex-1">
        <p className="text-foreground text-sm">
          <span className="font-semibold">Consejo de seguridad:</span> Tus datos fiscales son
          personales. <span className="font-semibold">Contafy</span> nunca te pedirá tu contraseña o
          archivos .key por correo o mensaje. Protege tu información.
        </p>
      </div>
    </div>
  );
}
