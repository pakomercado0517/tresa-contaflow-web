"use client";

import { Camera, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function UserProfileCard() {
  // TODO: Obtener datos del usuario desde la API
  const user = {
    name: "Juan Pérez",
    email: "juan.perez@empresa.com",
    role: "ADMIN",
    memberSince: "2021",
    avatar: null,
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
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
            <h2 className="text-2xl font-semibold mb-1">{user.name}</h2>
            <p className="text-muted-foreground mb-3">{user.email}</p>
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-primary-foreground">
                {user.role}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Miembro desde {user.memberSince}
              </span>
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

