"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Eye, EyeOff, Lock, X, FileCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerFIEL } from "@/lib/api/sat-descarga.client";
import type { Profile } from "@/lib/types/profiles";

interface FIELRegistrationDialogProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  hasExistingCredentials: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface FileDropZoneProps {
  label: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  description: string;
}

function FileDropZone({
  label,
  accept,
  file,
  onFileSelect,
  description,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) onFileSelect(droppedFile);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) onFileSelect(selected);
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <FileCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragOver
              ? "border-[#00ff80]/50 bg-[#00ff80]/5"
              : "border-border/40 hover:border-border/70 hover:bg-white/2"
          }`}
        >
          <CloudUpload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              o haz clic para seleccionar
            </p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

export function FIELRegistrationDialog({
  profile,
  isOpen,
  onClose,
  hasExistingCredentials,
}: FIELRegistrationDialogProps) {
  const [cerFile, setCerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const queryClient = useQueryClient();

  const resetForm = useCallback(() => {
    setCerFile(null);
    setKeyFile(null);
    setPassword("");
    setIsPasswordVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!cerFile || !keyFile || !password) {
        throw new Error("Todos los campos son requeridos");
      }

      const [certificate_base64, private_key_base64] = await Promise.all([
        fileToBase64(cerFile),
        fileToBase64(keyFile),
      ]);

      return registerFIEL({
        profile_id: profile.id,
        certificate_base64,
        private_key_base64,
        password,
      });
    },
    onSuccess: () => {
      toast.success("Credenciales registradas", {
        description: `La FIEL de ${profile.nombre} se registró correctamente.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["sat-download-status", profile.id],
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error("Error al registrar credenciales", {
        description: error.message,
      });
    },
  });

  const isFormValid = cerFile && keyFile && password.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[520px] border-border/40">
        <DialogHeader>
          <DialogTitle>
            {hasExistingCredentials
              ? "Actualizar Credenciales FIEL"
              : "Registrar Credenciales FIEL"}
          </DialogTitle>
          <DialogDescription>
            Sube el certificado (.cer) y la llave privada (.key) de la e.firma
            para <span className="font-medium text-foreground">{profile.nombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <FileDropZone
            label="Certificado (.cer)"
            accept=".cer"
            file={cerFile}
            onFileSelect={setCerFile}
            description="Arrastra tu archivo .cer aquí"
          />

          <FileDropZone
            label="Llave Privada (.key)"
            accept=".key"
            file={keyFile}
            onFileSelect={setKeyFile}
            description="Arrastra tu archivo .key aquí"
          />

          <div className="space-y-2">
            <Label htmlFor="fiel-password" className="text-sm font-medium">
              Contraseña de la llave privada
            </Label>
            <div className="relative">
              <Input
                id="fiel-password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña de tu llave privada"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {isPasswordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border/30 bg-muted/30 px-3 py-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tus credenciales se cifran y almacenan de forma segura. Nunca se
              guardan en texto plano.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="border-border/60"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!isFormValid || mutation.isPending}
              className="bg-[#00ff80] text-gray-900 hover:bg-[#00ff80]/90"
            >
              {mutation.isPending
                ? "Registrando..."
                : hasExistingCredentials
                  ? "Actualizar credenciales"
                  : "Registrar credenciales"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
