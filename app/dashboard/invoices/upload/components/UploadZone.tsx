"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const xmlFiles = files.filter((file) =>
        file.name.toLowerCase().endsWith(".xml")
      );

      if (xmlFiles.length > 0) {
        onFilesSelected(xmlFiles);
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      // Reset input para permitir seleccionar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onFilesSelected]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      className={cn(
        "border-2 border-dashed p-8 transition-colors",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-border bg-card/50 hover:border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <Upload className="h-12 w-12 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium">
            Arrastra tus archivos XML aquí
          </p>
          <p className="text-sm text-muted-foreground">
            o haz clic para explorar carpetas
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Soporte XML versión 3.3 y 4.0
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xml"
          onChange={handleFileInput}
          className="hidden"
        />

        <Button
          onClick={handleClick}
          variant="outline"
          className="bg-primary/10 border-primary/20 hover:bg-primary/20"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Seleccionar Archivos
        </Button>
      </div>
    </Card>
  );
}

