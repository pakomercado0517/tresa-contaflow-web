import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "search" | "empty";
  compact?: boolean; // Para usar dentro de tablas
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
  compact = false,
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        compact ? "py-4" : "p-8"
      )}
    >
      {Icon && (
        <div
          className={cn(
            "rounded-full bg-muted flex items-center justify-center",
            compact ? "h-12 w-12" : "h-16 w-16"
          )}
        >
          <Icon className={cn("text-muted-foreground", compact ? "h-6 w-6" : "h-8 w-8")} />
        </div>
      )}
      <div className="space-y-2">
        <p className={cn("font-semibold", compact ? "text-base" : "text-lg")}>{title}</p>
        {description && (
          <p className={cn("text-muted-foreground", compact ? "text-xs max-w-sm" : "text-sm max-w-md")}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button size={compact ? "sm" : "default"}>{actionLabel}</Button>
            </Link>
          ) : (
            <Button size={compact ? "sm" : "default"} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card className={cn("bg-card border-border", variant === "search" && "border-dashed")}>
      {content}
    </Card>
  );
}
