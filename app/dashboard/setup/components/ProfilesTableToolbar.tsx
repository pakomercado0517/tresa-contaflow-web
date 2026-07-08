'use client';

import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfilesTableExportActionButton } from './ProfilesTableExportActionButton';

interface ProfilesTableExportSlot {
  enabled: boolean;
  isLoading: boolean;
  onExport: () => void;
  label: string;
  disabledTitle: string;
}

interface ProfilesTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  pdfExport: ProfilesTableExportSlot;
  excelExport: ProfilesTableExportSlot;
}

export function ProfilesTableToolbar({
  searchQuery,
  onSearchChange,
  pdfExport,
  excelExport,
}: ProfilesTableToolbarProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por Razón Social o RFC..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
        <ProfilesTableExportActionButton
          label={pdfExport.label}
          enabled={pdfExport.enabled}
          isLoading={pdfExport.isLoading}
          disabledTitle={pdfExport.disabledTitle}
          onClick={pdfExport.onExport}
        />
        <ProfilesTableExportActionButton
          label={excelExport.label}
          enabled={excelExport.enabled}
          isLoading={excelExport.isLoading}
          disabledTitle={excelExport.disabledTitle}
          onClick={excelExport.onExport}
        />
      </div>
    </div>
  );
}
