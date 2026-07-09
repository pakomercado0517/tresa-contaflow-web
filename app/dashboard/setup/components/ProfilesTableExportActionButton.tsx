'use client';

import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfilesTableExportActionButtonProps {
  label: string;
  enabled: boolean;
  isLoading: boolean;
  disabledTitle: string;
  onClick: () => void;
}

export function ProfilesTableExportActionButton({
  label,
  enabled,
  isLoading,
  disabledTitle,
  onClick,
}: ProfilesTableExportActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={!enabled || isLoading}
      title={!enabled ? disabledTitle : undefined}
      className={!enabled ? 'disabled:opacity-50' : undefined}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Download className="mr-2 h-4 w-4" aria-hidden />
      )}
      {isLoading ? 'Generando...' : label}
    </Button>
  );
}
