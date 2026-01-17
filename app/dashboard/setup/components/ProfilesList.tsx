"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Building2, User, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/types/subscription";

interface Profile {
  id: string;
  nombre: string;
  rfc: string;
  tipo_persona: "FISICA" | "MORAL";
  regimen_fiscal: string | null;
}

interface ProfilesListProps {
  profiles: Profile[];
  canCreate: boolean;
  remaining: number;
  plan: Plan;
  currentCount: number;
}

export function ProfilesList({
  profiles,
}: ProfilesListProps) {
  const router = useRouter();

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes perfiles aún</h3>
          <p className="text-muted-foreground text-center mb-4">
            Crea tu primer perfil RFC para comenzar a gestionar tus facturas
          </p>
          <Link href="/dashboard/setup/profiles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Perfil
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <Card key={profile.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {profile.tipo_persona === "FISICA" ? (
                  <User className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">{profile.nombre}</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {profile.tipo_persona === "FISICA" ? "Física" : "Moral"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">RFC</p>
                <p className="font-mono text-sm">{profile.rfc}</p>
              </div>
              {profile.regimen_fiscal && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Régimen Fiscal
                  </p>
                  <p className="text-sm">{profile.regimen_fiscal}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/dashboard/setup/profiles/${profile.id}`)
                  }
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // TODO: Implementar eliminación
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

