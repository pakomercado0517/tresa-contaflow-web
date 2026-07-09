'use client';

import { User, Building2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CreateProfileTipoPersonaSelectorProps {
  tipoPersona: 'FISICA' | 'MORAL';
  onChange: (tipo: 'FISICA' | 'MORAL') => void;
}

export function CreateProfileTipoPersonaSelector({
  tipoPersona,
  onChange,
}: CreateProfileTipoPersonaSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Tipo de Persona</Label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('FISICA')}
          className={cn(
            'relative rounded-lg border-2 p-4 transition-all',
            tipoPersona === 'FISICA'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:border-primary/50'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <User className="h-6 w-6" />
            <span className="text-sm font-medium">Persona Física</span>
          </div>
          {tipoPersona === 'FISICA' && (
            <div className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onChange('MORAL')}
          className={cn(
            'relative rounded-lg border-2 p-4 transition-all',
            tipoPersona === 'MORAL'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:border-primary/50'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="text-sm font-medium">Persona Moral</span>
          </div>
          {tipoPersona === 'MORAL' && (
            <div className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
