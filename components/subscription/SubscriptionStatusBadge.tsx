import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/lib/types/subscription";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

export function SubscriptionStatusBadge({
  status,
  className,
}: SubscriptionStatusBadgeProps) {
  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Activo",
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
        };
      case "TRIALING":
        return {
          label: "Período de Prueba",
          variant: "secondary" as const,
          className: "bg-blue-500 hover:bg-blue-600 text-white",
        };
      case "PAST_DUE":
        return {
          label: "Pago Pendiente",
          variant: "destructive" as const,
          className: "bg-orange-500 hover:bg-orange-600",
        };
      case "UNPAID":
        return {
          label: "Pago Fallido",
          variant: "destructive" as const,
          className: "",
        };
      case "CANCELLED":
        return {
          label: "Cancelado",
          variant: "outline" as const,
          className: "border-red-500 text-red-500",
        };
      case "EXPIRED":
        return {
          label: "Expirado",
          variant: "outline" as const,
          className: "border-gray-500 text-gray-500",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}
