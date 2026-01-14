"use client";

import { Camera, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types/auth";

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  // Obtener el nombre completo o usar email como fallback
  const displayName = user.nombre
    ? user.apellido
      ? `${user.nombre} ${user.apellido}`
      : user.nombre
    : user.email.split("@")[0];

  // Obtener iniciales para el avatar
  const initials = user.nombre
    ? `${user.nombre[0]}${user.apellido?.[0] || ""}`.toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
              <Camera className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-1">{displayName}</h2>
            <p className="text-muted-foreground mb-3">{user.email}</p>
            <div className="flex items-center gap-3">
              {user.email_verified && (
                <Badge className="bg-primary text-primary-foreground">
                  Verificado
                </Badge>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Perfil Público
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

