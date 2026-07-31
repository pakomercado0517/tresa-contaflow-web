import { cn } from '@/lib/utils';

interface DashboardUpdatingOverlayProps {
  className?: string;
}

/** Velo semitransparente mientras se refrescan datos tras cambiar filtros. */
export function DashboardUpdatingOverlay({ className }: DashboardUpdatingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 bg-background/75 backdrop-blur-[2px] transition-opacity duration-300',
        className
      )}
      aria-hidden
    />
  );
}
