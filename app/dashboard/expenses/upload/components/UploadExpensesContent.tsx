'use client';

import { UploadZone } from './UploadZone';
import { FilesQueue } from './FilesQueue';
import { UploadSummary } from './UploadSummary';
import { DidYouKnowCard } from './DidYouKnowCard';
import type { Profile } from '@/lib/types/profiles';
import type { Subscription } from '@/lib/types/subscription';
import { useUploadExpensesFlow } from './use-upload-expenses-flow';
import { UploadExpensesUsageAlert } from './UploadExpensesUsageAlert';
import { UploadExpensesMessageDialog } from './UploadExpensesMessageDialog';
import { UploadExpensesProcessDialog } from './UploadExpensesProcessDialog';

export type { QueuedExpenseFile, QueuedFile } from './upload-expenses-types';

interface UploadExpensesContentProps {
  profiles: Profile[];
  subscription: Subscription | null;
  expensesUsed: number;
}

export function UploadExpensesContent({
  profiles,
  subscription,
  expensesUsed,
}: UploadExpensesContentProps) {
  const flow = useUploadExpensesFlow({ profiles, subscription, expensesUsed });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Gastos XML</h1>
          <p className="text-muted-foreground mt-2">
            Sube tus archivos CFDI de gastos para validación y procesamiento automático. Detectamos
            errores antes de que lleguen al SAT. El perfil se selecciona al confirmar el
            procesamiento.
          </p>
        </div>
      </div>

      <UploadExpensesUsageAlert
        expensesLimit={flow.expensesLimit}
        expensesUsed={flow.expensesUsed}
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

      <UploadExpensesMessageDialog
        open={flow.isDialogOpen}
        title={flow.dialogTitle}
        message={flow.dialogMessage}
        onOpenChange={flow.setIsDialogOpen}
      />

      <UploadExpensesProcessDialog
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
