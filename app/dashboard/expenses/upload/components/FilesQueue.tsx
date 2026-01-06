"use client";

import { FileText, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QueuedFile } from "./UploadExpensesContent";

interface FilesQueueProps {
  files: QueuedFile[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
}

export function FilesQueue({
  files,
  onRemoveFile,
  onClearAll,
}: FilesQueueProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
              className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
            >
              <div className="flex-shrink-0">
                {file.status === "error" ? (
                  <div className="rounded-full bg-destructive/10 p-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                ) : (
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                {file.status === "error" && file.errorMessage && (
                  <p className="text-xs text-destructive mt-1">
                    {file.errorMessage}
                  </p>
                )}
                {file.status === "valid" && (
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
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    file.status === "valid"
                      ? "default"
                      : file.status === "error"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {file.status === "valid"
                    ? "VÁLIDO"
                    : file.status === "error"
                    ? "ERROR"
                    : "PENDIENTE"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveFile(file.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

