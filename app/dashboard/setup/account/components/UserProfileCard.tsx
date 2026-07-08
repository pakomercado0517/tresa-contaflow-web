"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/lib/api/auth";
import { uploadUserLogoAction } from "../actions/upload-user-logo";
import type { User } from "@/lib/types/auth";

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const displayName = user.nombre
    ? user.apellido
      ? `${user.nombre} ${user.apellido}`
      : user.nombre
    : user.email.split("@")[0];

  const initials = user.nombre
    ? `${user.nombre[0]}${user.apellido?.[0] || ""}`.toUpperCase()
    : user.email[0].toUpperCase();

  const handleLogoClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.set("logo", file);
      const logoUrl = await uploadUserLogoAction(user.id, formData);
      await updateProfile({ logo_url: logoUrl });
      router.refresh();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Error al subir el logo. Intenta de nuevo."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Avatar con logo */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              {user.logo_url ? (
                <AvatarImage src={user.logo_url} alt="Logo" />
              ) : null}
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              aria-hidden
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleLogoClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              title="Cambiar logo"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-primary-foreground" />
              )}
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-1">{displayName}</h2>
            <p className="text-muted-foreground mb-3">{user.email}</p>
            {uploadError && (
              <p className="text-sm text-destructive mb-2">{uploadError}</p>
            )}
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
