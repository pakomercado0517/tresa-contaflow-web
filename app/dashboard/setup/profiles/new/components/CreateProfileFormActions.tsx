'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateProfileFormActionsProps {
  isLoading: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
}

export function CreateProfileFormActions({
  isLoading,
  isSubmitDisabled,
  onCancel,
}: CreateProfileFormActionsProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" className="flex-1" size="lg" disabled={isSubmitDisabled}>
        {isLoading ? 'Creando perfil...' : 'Crear Perfil'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
