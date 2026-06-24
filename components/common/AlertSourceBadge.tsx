import { Badge } from '@/components/ui/badge';
import {
  ALERT_SOURCE_LABELS,
  type AlertSourceLabelKey,
} from '@/lib/constants/alert-sources';
import { cn } from '@/lib/utils';

interface AlertSourceBadgeProps {
  source: AlertSourceLabelKey;
  className?: string;
}

export function AlertSourceBadge({ source, className }: AlertSourceBadgeProps) {
  return (
    <Badge variant="outline" className={cn('text-xs font-normal', className)}>
      {ALERT_SOURCE_LABELS[source]}
    </Badge>
  );
}
