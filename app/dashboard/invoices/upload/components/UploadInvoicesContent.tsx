"use client";

import { useState } from "react";
import { UploadZone } from "./UploadZone";
import { FilesQueue } from "./FilesQueue";
import { UploadSummary } from "./UploadSummary";
import { DidYouKnowCard } from "./DidYouKnowCard";
import { ProfileSelector } from "./ProfileSelector";
import { uploadInvoice } from "@/lib/api/invoices.client";
import { ApiError } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/profiles";
import type { ValidationState } from "@/lib/types/invoices";

interface UploadInvoicesContentProps {
  profiles: Profile[];
}

export interface QueuedFile {
  id: string;
  file: File;
  status: "pending" | "valid" | "uploading" | "success" | "error";
  errorMessage?: string;
  size: number;
  type?: string; // CFDI 3.3, CFDI 4.0, Nómina 1.2, etc.
  validacion?: ValidationState; // Guardar validación de la API
}

export function UploadInvoicesContent({ profiles }: UploadInvoicesContentProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles[0]?.id || ""
  );
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para el dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error" | "warning">("success");

  const handleFilesSelected = (files: File[]) => {
    const newFiles: QueuedFile[] = files.map((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const validation = validateFile(file);
      
      return {
        id,
        file,
        status: validation.valid ? "valid" : "error",
        errorMessage: validation.error,
        size: file.size,
        type: validation.type,
      };
    });

    setQueuedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleClearAll = () => {
    setQueuedFiles([]);
  };

  const showDialog = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedProfileId) {
      showDialog(
        "Empresa no seleccionada",
        "Por favor selecciona una empresa antes de procesar los archivos.",
        "warning"
      );
      return;
    }

    const validFiles = queuedFiles.filter((f) => f.status === "valid");
    if (validFiles.length === 0) {
      showDialog(
        "Sin archivos válidos",
        "No hay archivos válidos para procesar. Por favor, agrega archivos XML válidos.",
        "warning"
      );
      return;
    }

    setIsProcessing(true);

    // Procesar cada archivo individualmente
    let successCount = 0;
    let errorCount = 0;

    for (const queuedFile of validFiles) {
      // Marcar como uploading
      setQueuedFiles((prev) =>
        prev.map((f) =>
          f.id === queuedFile.id ? { ...f, status: "uploading" } : f
        )
      );

      try {
        const result = await uploadInvoice(queuedFile.file, selectedProfileId);
        
        // Marcar como success
        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: "success", validacion: result.validacion }
              : f
          )
        );
        successCount++;
      } catch (error) {
        errorCount++;
        let errorMessage = "Error al subir archivo";
        
        if (error instanceof ApiError) {
          errorMessage = error.message;
          // Si hay datos de validación en el error, guardarlos
          const validationData = (error.data as { validacion?: ValidationState })?.validacion;
          
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queuedFile.id
                ? {
                    ...f,
                    status: "error",
                    errorMessage,
                    validacion: validationData,
                  }
                : f
            )
          );
        } else {
          // Marcar como error
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queuedFile.id
                ? {
                    ...f,
                    status: "error",
                    errorMessage: error instanceof Error ? error.message : errorMessage,
                  }
                : f
            )
          );
        }
      }
    }

    setIsProcessing(false);

    // Mostrar resumen
    if (errorCount === 0) {
      showDialog(
        "¡Procesamiento exitoso!",
        `Se procesaron ${successCount} archivo(s) correctamente.`,
        "success"
      );
    } else {
      showDialog(
        "Procesamiento completado",
        `✓ ${successCount} archivo(s) exitoso(s)\n✗ ${errorCount} archivo(s) con error(es)\n\nRevisa los detalles de cada archivo en la lista.`,
        errorCount === validFiles.length ? "error" : "warning"
      );
    }
  };

  const validCount = queuedFiles.filter((f) => f.status === "valid").length;
  const errorCount = queuedFiles.filter((f) => f.status === "error").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Facturas XML</h1>
          <p className="text-muted-foreground mt-2">
            Sube tus archivos CFDI para validación y procesamiento automático.
            Detectamos errores antes de que lleguen al SAT.
          </p>
        </div>
        <ProfileSelector
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onProfileChange={setSelectedProfileId}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Upload Zone */}
        <div className="lg:col-span-1">
          <UploadZone onFilesSelected={handleFilesSelected} />
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <UploadSummary
            totalFiles={queuedFiles.length}
            validCount={validCount}
            errorCount={errorCount}
            onProcess={handleProcess}
            isProcessing={isProcessing}
            disabled={queuedFiles.length === 0 || validCount === 0}
          />
        </div>
      </div>

      {/* Files Queue */}
      {queuedFiles.length > 0 && (
        <FilesQueue
          files={queuedFiles}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
        />
      )}

      {/* Did You Know Card */}
      <DidYouKnowCard />

      {/* Dialog para mensajes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Función de validación de archivos
function validateFile(file: File): { valid: boolean; error?: string; type?: string } {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split(".").pop();

  // Validar extensión - solo XML
  if (fileExtension !== "xml") {
    return {
      valid: false,
      error: "Formato inválido. Solo se permiten archivos .xml",
    };
  }

  // Para XML, validación básica (el tipo se detectará al leer el contenido)
  return { valid: true, type: "XML" };
}

