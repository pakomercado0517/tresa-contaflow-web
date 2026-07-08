"use client";

import Link from "next/link";
import { FileText, X, AlertCircle, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QueuedFile } from './upload-expenses-types';

interface FilesQueueProps {
  files: QueuedFile[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusIcon(status: QueuedFile["status"]) {
  switch (status) {
    case "error":
      return (
        <div className="rounded-full bg-destructive/10 p-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
      );
    case "success":
      return (
        <div className="rounded-full bg-green-500/10 p-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
      );
    case "uploading":
      return (
        <div className="rounded-full bg-blue-500/10 p-2">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        </div>
      );
    default:
      return (
        <div className="rounded-full bg-primary/10 p-2">
          <FileText className="h-5 w-5 text-primary" />
        </div>
      );
  }
}

function getStatusBadge(status: QueuedFile["status"]) {
  switch (status) {
    case "valid":
      return (
        <Badge variant="default">
          VÁLIDO
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive">
          ERROR
        </Badge>
      );
    case "success":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          ÉXITO
        </Badge>
      );
    case "uploading":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          SUBIENDO...
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          PENDIENTE
        </Badge>
      );
  }
}

export function FilesQueue({
  files,
  onRemoveFile,
  onClearAll,
}: FilesQueueProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Archivos en cola ({files.length})</CardTitle>
          {files.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive"
            >
              Limpiar todo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(file.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    {file.type && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {file.type}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(file.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFile(file.id)}
                    className="h-8 w-8"
                    disabled={file.status === "uploading"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mostrar mensaje de error */}
              {file.status === "error" && file.errorMessage && (
                <div className="pl-14 pr-2 space-y-1">
                  <p className="text-xs text-destructive">
                    {file.errorMessage}
                  </p>
                  {file.duplicateListHref && (
                    <Link
                      href={file.duplicateListHref}
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      Buscar en el listado por UUID
                    </Link>
                  )}
                </div>
              )}

              {/* Mostrar validaciones */}
              {file.validacion && (
                <div className="pl-14 pr-2 space-y-1">
                  {/* Advertencias */}
                  {file.validacion.advertencias && file.validacion.advertencias.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-500">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        {file.validacion.advertencias.map((adv) => (
                          <p key={`${file.id}-adv-${adv}`}>{adv}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errores de validación */}
                  {file.validacion.errores && file.validacion.errores.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        {file.validacion.errores.map((err) => (
                          <p key={`${file.id}-err-${err}`}>{err}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Información de validación exitosa */}
                  {file.status === "success" && file.validacion.valido && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        <p>Archivo procesado y guardado correctamente</p>
                      </div>
                      {file.complementViewHref && (
                        <Link
                          href={file.complementViewHref}
                          className="text-primary text-xs font-medium hover:underline"
                        >
                          Ver complemento de pago
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

