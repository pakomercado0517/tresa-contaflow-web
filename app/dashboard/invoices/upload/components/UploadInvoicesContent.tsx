'use client';

import { UploadZone } from './UploadZone';
import { FilesQueue } from './FilesQueue';
import { UploadSummary } from './UploadSummary';
import { DidYouKnowCard } from './DidYouKnowCard';
import type { Profile } from '@/lib/types/profiles';
import type { Subscription } from '@/lib/types/subscription';
import { useUploadInvoicesFlow } from './use-upload-invoices-flow';
import { UploadInvoicesUsageAlert } from './UploadInvoicesUsageAlert';
import { UploadInvoicesMessageDialog } from './UploadInvoicesMessageDialog';
import { UploadInvoicesProcessDialog } from './UploadInvoicesProcessDialog';

export type { QueuedInvoiceFile, QueuedFile } from './upload-invoices-types';

interface UploadInvoicesContentProps {
  profiles: Profile[];
  subscription: Subscription | null;
  invoicesUsed: number;
}

export function UploadInvoicesContent({
  profiles,
  subscription,
  invoicesUsed,
}: UploadInvoicesContentProps) {
  const flow = useUploadInvoicesFlow({ profiles, subscription, invoicesUsed });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Facturas XML</h1>
          <p className="text-muted-foreground mt-2">
            Sube tus archivos CFDI para validación y procesamiento automático. Detectamos errores
            antes de que lleguen al SAT. El perfil se selecciona al confirmar el procesamiento.
          </p>
        </div>
      </div>

      <UploadInvoicesUsageAlert
        invoicesLimit={flow.invoicesLimit}
        invoicesUsed={flow.invoicesUsed}
        usagePercentage={flow.usagePercentage}
        warningLevel={flow.warningLevel}
        remaining={flow.remaining}
        recommendedPlan={flow.recommendedPlan}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <UploadZone onFilesSelected={flow.handleFilesSelected} />
        </div>
        <div className="lg:col-span-1">
          <UploadSummary
            totalFiles={flow.queuedFiles.length}
            validCount={flow.validCount}
            errorCount={flow.errorCount}
            onProcess={flow.handleProcess}
            isProcessing={flow.isProcessing}
            disabled={flow.isProcessDisabled}
          />
        </div>
      </div>

      {flow.queuedFiles.length > 0 && (
        <FilesQueue
          files={flow.queuedFiles}
          onRemoveFile={flow.handleRemoveFile}
          onClearAll={flow.handleClearAll}
        />
      )}

      <DidYouKnowCard />

      <UploadInvoicesMessageDialog
        open={flow.isDialogOpen}
        title={flow.dialogTitle}
        message={flow.dialogMessage}
        onOpenChange={flow.setIsDialogOpen}
      />

      <UploadInvoicesProcessDialog
        open={flow.isProcessDialogOpen}
        onOpenChange={flow.setIsProcessDialogOpen}
        validCount={flow.validCount}
        profiles={profiles}
        selectedProfileId={flow.selectedProfileId}
        onProfileChange={flow.setSelectedProfileId}
        selectedProfile={flow.selectedProfile}
        isProcessing={flow.isProcessing}
        onConfirm={flow.handleConfirmProcess}
      />
    </div>
  );
}
