'use client';

import { useSyncExternalStore } from 'react';

const GENERATED_AT_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

function getGeneratedAtFormatted(): string {
  return new Date().toLocaleString('es-MX', GENERATED_AT_FORMAT);
}

function subscribeToGeneratedAt(): () => void {
  return () => {};
}

interface ReportGeneratedAtLineProps {
  prefix?: string;
}

export function ReportGeneratedAtLine({ prefix = 'Fecha de generación: ' }: ReportGeneratedAtLineProps) {
  const formatted = useSyncExternalStore(
    subscribeToGeneratedAt,
    getGeneratedAtFormatted,
    () => null,
  );

  return (
    <p>
      {prefix}
      {formatted ?? '…'}
    </p>
  );
}
