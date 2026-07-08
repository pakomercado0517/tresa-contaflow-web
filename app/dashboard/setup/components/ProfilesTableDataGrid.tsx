'use client';

import { Building2, User, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Profile } from '@/lib/types/profiles';
import { RegimenFiscalCell } from './RegimenFiscalCell';

interface ProfilesTableDataGridProps {
  profiles: Profile[];
  descripcionMap: Record<string, string>;
  isDeleting: boolean;
  onEdit: (profileId: string) => void;
  onDelete: (profile: Profile) => void;
}

export function ProfilesTableDataGrid({
  profiles,
  descripcionMap,
  isDeleting,
  onEdit,
  onDelete,
}: ProfilesTableDataGridProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ENTIDAD / RFC</TableHead>
            <TableHead>TIPO DE PERSONA</TableHead>
            <TableHead>RÉGIMEN FISCAL</TableHead>
            <TableHead className="text-right">ACCIONES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id} className={profile.frozen ? 'opacity-60' : ''}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {profile.tipo_persona === 'FISICA' ? (
                    <User className="text-muted-foreground h-5 w-5" />
                  ) : (
                    <Building2 className="text-muted-foreground h-5 w-5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{profile.nombre}</p>
                      {profile.frozen && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          🔒 Congelado
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">{profile.rfc}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    profile.tipo_persona === 'FISICA'
                      ? 'border-purple-500/50 text-purple-600 dark:text-purple-400'
                      : 'border-blue-500/50 text-blue-600 dark:text-blue-400'
                  }
                >
                  {profile.tipo_persona === 'FISICA' ? 'Persona Física' : 'Persona Moral'}
                </Badge>
              </TableCell>
              <TableCell className="align-top">
                <RegimenFiscalCell
                  regimenesFiscales={profile.regimenes_fiscales ?? []}
                  descripcionMap={descripcionMap}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(profile.id)}
                    disabled={!profile.id || profile.frozen}
                    title={profile.frozen ? 'No puedes editar un perfil congelado' : ''}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(profile)}
                    disabled={isDeleting || profile.frozen}
                    title={profile.frozen ? 'No puedes eliminar un perfil congelado' : ''}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
