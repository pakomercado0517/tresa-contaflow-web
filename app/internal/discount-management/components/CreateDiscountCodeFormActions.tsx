import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CreateDiscountCodeFormActionsProps {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export function CreateDiscountCodeFormActions({ isSubmitting, error, success }: CreateDiscountCodeFormActionsProps) {
  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          Código de descuento creado exitosamente
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando...
          </>
        ) : (
          'Crear Código'
        )}
      </Button>
    </>
  );
}
