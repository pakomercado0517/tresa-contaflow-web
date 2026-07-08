export interface RegimenFilterConfig {
  selected: string;
  onChange: (regimen: string) => void;
  options: { value: string; label: string }[];
  disabled: boolean;
}

export interface ListHeaderExportConfig {
  pdf: {
    allowed: boolean;
    previewHref?: string;
    onExport: () => void;
  };
  excel: {
    allowed: boolean;
    onExport: () => void;
  };
}

export interface ManualEntryHeaderAction {
  onAdd: () => void;
  blockReason: 'no_profile' | 'no_period' | null;
}
