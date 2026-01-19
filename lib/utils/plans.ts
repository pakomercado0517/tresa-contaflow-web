import type { Plan, PlanLimits, AvailablePlan } from "@/lib/types/subscription";

export interface PlanFeature {
  label: string;
  value: string | number;
}

export interface PlanDetails {
  id: Plan;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number; // Precio mensual cuando se paga anualmente (con descuento)
  };
  icon: string; // Nombre del icono de lucide-react
  features: PlanFeature[];
  isPopular?: boolean;
  xmlLimit: number | "unlimited";
  profilesLimit: number | "unlimited";
}

export const PLANS: PlanDetails[] = [
  {
    id: "FREE",
    name: "Free",
    description: "Para freelancers que inician.",
    price: {
      monthly: 0,
      annual: 0,
    },
    icon: "Leaf",
    features: [
      { label: "RFC Emisor", value: 1 },
      { label: "Archivos XML / mes", value: 50 },
      { label: "Validación básica", value: "Sí" },
    ],
    xmlLimit: 50,
    profilesLimit: 1,
  },
  {
    id: "BASIC",
    name: "Básico",
    description: "Pequeños negocios en crecimiento.",
    price: {
      monthly: 300,
      annual: 240, // 20% descuento
    },
    icon: "Rocket",
    features: [
      { label: "RFCs Emisores", value: 3 },
      { label: "Archivos XML / mes", value: 500 },
      { label: "Exportación PDF", value: "Sí" },
      { label: "Reportes completos", value: "Sí" },
      { label: "Soporte por email", value: "Sí" },
    ],
    xmlLimit: 500,
    profilesLimit: 3,
  },
  {
    id: "PRO",
    name: "Pro",
    description: "Contadores y despachos.",
    price: {
      monthly: 800,
      annual: 640, // 20% descuento
    },
    icon: "Gem",
    features: [
      { label: "RFCs Emisores", value: 10 },
      { label: "Archivos XML ilimitados", value: "Sí" },
      { label: "Exportación PDF y Excel", value: "Sí" },
      { label: "Acceso a API", value: "Sí" },
      { label: "Soporte Prioritario", value: "Sí" },
    ],
    isPopular: true,
    xmlLimit: "unlimited",
    profilesLimit: 10,
  },
  {
    id: "ENTERPRISE",
    name: "Empresarial",
    description: "Grandes volúmenes y equipos.",
    price: {
      monthly: 1200,
      annual: 960, // 20% descuento
    },
    icon: "Building2",
    features: [
      { label: "RFCs Emisores", value: "Ilimitados" },
      { label: "Archivos XML", value: "Ilimitados" },
      { label: "Multi-usuario (Roles)", value: "Sí" },
      { label: "Gerente de cuenta", value: "Sí" },
      { label: "Integraciones personalizadas", value: "Sí" },
    ],
    xmlLimit: "unlimited",
    profilesLimit: "unlimited",
  },
];

export function getPlanDetails(planId: Plan): PlanDetails {
  return PLANS.find((p) => p.id === planId) || PLANS[0];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Genera las features de un plan dinámicamente basándose en los límites del backend
 */
export function generatePlanFeatures(limits: PlanLimits): PlanFeature[] {
  const features: PlanFeature[] = [];

  // RFCs Emisores (Profiles)
  if (limits.profiles === null) {
    features.push({ label: "RFCs Emisores", value: "Ilimitados" });
  } else {
    features.push({
      label: limits.profiles === 1 ? "RFC Emisor" : "RFCs Emisores",
      value: limits.profiles,
    });
  }

  // Archivos XML al mes (Facturas + Gastos)
  const invoicesLimit = limits.invoicesPerMonth;
  const expensesLimit = limits.expensesPerMonth;
  
  if (invoicesLimit === null && expensesLimit === null) {
    features.push({ label: "Archivos XML ilimitados", value: "Sí" });
  } else {
    // Calcular límite total si ambos tienen límite
    const totalLimit =
      invoicesLimit !== null && expensesLimit !== null
        ? invoicesLimit + expensesLimit
        : null;

    if (totalLimit === null) {
      features.push({ label: "Archivos XML ilimitados", value: "Sí" });
    } else {
      features.push({ label: "Archivos XML / mes", value: totalLimit });
    }
  }

  // Exportación PDF
  if (limits.exportPDF) {
    features.push({ label: "Exportación PDF", value: "Sí" });
  }

  // Exportación Excel
  if (limits.exportExcel) {
    features.push({ label: "Exportación Excel", value: "Sí" });
  }

  // Reportes
  if (limits.reports === "basic") {
    features.push({ label: "Validación básica", value: "Sí" });
  } else if (limits.reports === "complete") {
    features.push({ label: "Reportes completos", value: "Sí" });
  } else if (limits.reports === "advanced") {
    features.push({ label: "Reportes avanzados", value: "Sí" });
  }

  // Soporte
  if (limits.support === "email") {
    features.push({ label: "Soporte por email", value: "Sí" });
  } else if (limits.support === "priority") {
    features.push({ label: "Soporte Prioritario", value: "Sí" });
  }

  // Acceso a API
  if (limits.apiAccess) {
    features.push({ label: "Acceso a API", value: "Sí" });
  }

  return features;
}

/**
 * Obtiene información detallada de un plan desde AvailablePlan
 */
export function getPlanDetailsFromAvailable(
  plan: AvailablePlan
): PlanDetails {
  const features = generatePlanFeatures(plan.limits);

  // Mapear el nombre del plan a un formato más legible
  const planNames: Record<Plan, string> = {
    FREE: "Free",
    BASIC: "Básico",
    PRO: "Pro",
    ENTERPRISE: "Empresarial",
  };

  const planDescriptions: Record<Plan, string> = {
    FREE: "Para freelancers que inician.",
    BASIC: "Pequeños negocios en crecimiento.",
    PRO: "Contadores y despachos.",
    ENTERPRISE: "Grandes volúmenes y equipos.",
  };

  const planIcons: Record<Plan, string> = {
    FREE: "Leaf",
    BASIC: "Rocket",
    PRO: "Gem",
    ENTERPRISE: "Building2",
  };

  return {
    id: plan.id,
    name: planNames[plan.id],
    description: planDescriptions[plan.id],
    price: {
      monthly: plan.billing === "monthly" ? plan.price : plan.originalPrice || plan.price,
      annual: plan.billing === "annual" ? plan.price : plan.price * 12 * 0.85, // Aproximado para fallback
    },
    icon: planIcons[plan.id],
    features,
    isPopular: plan.id === "PRO",
    xmlLimit:
      plan.limits.invoicesPerMonth === null && plan.limits.expensesPerMonth === null
        ? "unlimited"
        : (plan.limits.invoicesPerMonth || 0) + (plan.limits.expensesPerMonth || 0),
    profilesLimit:
      plan.limits.profiles === null ? "unlimited" : plan.limits.profiles,
  };
}

