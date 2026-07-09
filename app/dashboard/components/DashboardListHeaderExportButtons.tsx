'use client';

import Link from 'next/link';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getExportUpgradeMessage } from '@/lib/utils/subscription';
import type { ListHeaderExportConfig } from './dashboard-list-header-types';

interface DashboardListHeaderExportButtonsProps {
  exportConfig: ListHeaderExportConfig;
}

export function DashboardListHeaderExportButtons({
  exportConfig,
}: DashboardListHeaderExportButtonsProps) {
  const { pdf, excel } = exportConfig;

  return (
    <>
      {pdf.allowed ? (
        pdf.previewHref ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5"
            asChild
          >
            <Link href={pdf.previewHref}>
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </Link>
          </Button>
        ) : (
          <Button
            onClick={pdf.onExport}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </Button>
        )
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-muted-foreground gap-1.5 disabled:opacity-50 cursor-not-allowed"
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              {getExportUpgradeMessage('pdf_export')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {excel.allowed ? (
        <Button
          onClick={excel.onExport}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Excel</span>
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-muted-foreground gap-1.5 disabled:opacity-50 cursor-not-allowed"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              {getExportUpgradeMessage('excel_export')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
