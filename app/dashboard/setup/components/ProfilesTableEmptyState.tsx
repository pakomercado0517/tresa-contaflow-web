'use client';

import Link from 'next/link';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProfilesTableEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border py-12">
      <Building2 className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="mb-2 text-lg font-semibold">No tienes perfiles aún</h3>
      <p className="text-muted-foreground mb-4 text-center">
        Crea tu primer perfil RFC para comenzar a gestionar tus facturas
      </p>
      <Link href="/dashboard/setup/profiles/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Primer Perfil
        </Button>
      </Link>
    </div>
  );
}
