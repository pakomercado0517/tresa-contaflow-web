'use client';

import { Building2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

interface DashboardSelectProfilePromptProps {
  hasProfiles: boolean;
}

export function DashboardSelectProfilePrompt({ hasProfiles }: DashboardSelectProfilePromptProps) {
  if (!hasProfiles) {
    return (
      <EmptyState
        icon={Building2}
        title="Aún no tienes perfiles (RFC)"
        description="Crea un perfil fiscal para empezar a ver tu resumen financiero, facturas y gastos."
        actionLabel="Crear perfil"
        actionHref="/dashboard/setup/profiles/new"
      />
    );
  }

  return (
    <EmptyState
      icon={Building2}
      title="Selecciona un RFC"
      description="Elige el perfil fiscal con el que quieres trabajar en el selector del encabezado. Así cargamos solo la información de esa empresa."
    />
  );
}
