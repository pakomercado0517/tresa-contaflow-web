"use client";

import { useState } from "react";
import { UploadZone } from "./UploadZone";
import { FilesQueue } from "./FilesQueue";
import { UploadSummary } from "./UploadSummary";
import { DidYouKnowCard } from "./DidYouKnowCard";
import { ProfileSelector } from "./ProfileSelector";
import type { Profile } from "@/lib/types/profiles";

interface UploadInvoicesContentProps {
  profiles: Profile[];
}

export interface QueuedFile {
  id: string;
  file: File;
  status: "valid" | "error" | "pending";
  errorMessage?: string;
  size: number;
  type?: string; // CFDI 3.3, CFDI 4.0, Nómina 1.2, etc.
}

export function UploadInvoicesContent({ profiles }: UploadInvoicesContentProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles[0]?.id || ""
  );
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleProcess = async () => {
    if (!selectedProfileId) {
      alert("Por favor selecciona una empresa");
      return;
    }

    const validFiles = queuedFiles.filter((f) => f.status === "valid");
    if (validFiles.length === 0) {
      alert("No hay archivos válidos para procesar");
      return;
    }

    setIsProcessing(true);
    // TODO: Implementar lógica de procesamiento
    console.log("Procesando archivos:", validFiles);
    
    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      alert("Facturas procesadas exitosamente");
      setQueuedFiles([]);
    }, 2000);
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
    </div>
  );
}

// Función de validación de archivos
function validateFile(file: File): { valid: boolean; error?: string; type?: string } {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split(".").pop();

  // Validar extensión
  if (fileExtension !== "xml" && fileExtension !== "zip") {
    return {
      valid: false,
      error: "Formato inválido. Solo se permiten archivos .xml o .zip",
    };
  }

  // Si es ZIP, es válido (se procesará después)
  if (fileExtension === "zip") {
    return { valid: true, type: "ZIP" };
  }

  // Para XML, validación básica (el tipo se detectará al leer el contenido)
  return { valid: true, type: "XML" };
}

