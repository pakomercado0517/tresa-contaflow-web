import type {
  Plan,
  PlanLimits,
  AvailablePlan,
} from "@/lib/types/subscription";

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
 * @param limits - Límites del plan desde el backend
 * @param planId - ID del plan para usar valores por defecto si el backend no envía límites SAT
 */
export function generatePlanFeatures(limits: PlanLimits, planId?: Plan): PlanFeature[] {
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

  // Buscador SAT - Valores por defecto según plan (si el backend no envía los campos)
  const satDefaults: Record<
    Plan,
    {
      satBasicSearchesPerMonth: number | null;
      satAISearchesPerMonth: number | null;
      satMaxResults: number | null;
      satHasAIExplanations: boolean;
      satHasHistory: boolean;
      satHasFavorites: boolean;
      satHasAlerts: boolean;
      satHasLearning: boolean;
      satHasAdvancedRanking: boolean;
    }
  > = {
    FREE: {
      satBasicSearchesPerMonth: null, // Ilimitadas
      satAISearchesPerMonth: 5,
      satMaxResults: 2,
      satHasAIExplanations: false,
      satHasHistory: false,
      satHasFavorites: false,
      satHasAlerts: false,
      satHasLearning: false,
      satHasAdvancedRanking: false,
    },
    BASIC: {
      satBasicSearchesPerMonth: null, // Ilimitadas
      satAISearchesPerMonth: 100,
      satMaxResults: 5,
      satHasAIExplanations: true,
      satHasHistory: true,
      satHasFavorites: false,
      satHasAlerts: false,
      satHasLearning: false,
      satHasAdvancedRanking: false,
    },
    PRO: {
      satBasicSearchesPerMonth: null, // Ilimitadas
      satAISearchesPerMonth: null, // Ilimitadas
      satMaxResults: null, // Ilimitados
      satHasAIExplanations: true,
      satHasHistory: true,
      satHasFavorites: true,
      satHasAlerts: true,
      satHasLearning: true,
      satHasAdvancedRanking: true,
    },
    ENTERPRISE: {
      satBasicSearchesPerMonth: null, // Ilimitadas
      satAISearchesPerMonth: null, // Ilimitadas
      satMaxResults: null, // Ilimitados
      satHasAIExplanations: true,
      satHasHistory: true,
      satHasFavorites: true,
      satHasAlerts: true,
      satHasLearning: true,
      satHasAdvancedRanking: true,
    },
  };

  // Usar valores del backend si están disponibles, sino usar defaults según plan
  const satBasicSearches =
    limits.satBasicSearchesPerMonth !== undefined
      ? limits.satBasicSearchesPerMonth
      : planId
        ? satDefaults[planId].satBasicSearchesPerMonth
        : undefined;

  const satAISearches =
    limits.satAISearchesPerMonth !== undefined
      ? limits.satAISearchesPerMonth
      : planId
        ? satDefaults[planId].satAISearchesPerMonth
        : undefined;

  const satMaxResults =
    limits.satMaxResults !== undefined
      ? limits.satMaxResults
      : planId
        ? satDefaults[planId].satMaxResults
        : undefined;

  const satHasAIExplanations =
    limits.satHasAIExplanations !== undefined
      ? limits.satHasAIExplanations
      : planId
        ? satDefaults[planId].satHasAIExplanations
        : false;

  const satHasHistory =
    limits.satHasHistory !== undefined
      ? limits.satHasHistory
      : planId
        ? satDefaults[planId].satHasHistory
        : false;

  const satHasFavorites =
    limits.satHasFavorites !== undefined
      ? limits.satHasFavorites
      : planId
        ? satDefaults[planId].satHasFavorites
        : false;

  const satHasAlerts =
    limits.satHasAlerts !== undefined
      ? limits.satHasAlerts
      : planId
        ? satDefaults[planId].satHasAlerts
        : false;

  const satHasLearning =
    limits.satHasLearning !== undefined
      ? limits.satHasLearning
      : planId
        ? satDefaults[planId].satHasLearning
        : false;

  const satHasAdvancedRanking =
    limits.satHasAdvancedRanking !== undefined
      ? limits.satHasAdvancedRanking
      : planId
        ? satDefaults[planId].satHasAdvancedRanking
        : false;

  // Buscador SAT - Búsquedas básicas
  if (satBasicSearches !== undefined) {
    if (satBasicSearches === null) {
      features.push({ label: "Búsquedas SAT básicas", value: "Ilimitadas" });
    } else {
      features.push({
        label: "Búsquedas SAT básicas / mes",
        value: satBasicSearches,
      });
    }
  }

  // Buscador SAT - Búsquedas con IA
  if (satAISearches !== undefined) {
    if (satAISearches === null) {
      features.push({ label: "Búsquedas SAT con IA", value: "Ilimitadas" });
    } else {
      features.push({
        label: "Búsquedas SAT con IA / mes",
        value: satAISearches,
      });
    }
  }

  // Buscador SAT - Máximo de resultados
  if (satMaxResults !== undefined) {
    if (satMaxResults === null) {
      features.push({
        label: "Resultados SAT por búsqueda",
        value: "Ilimitados",
      });
    } else {
      features.push({
        label: "Resultados SAT por búsqueda",
        value: `Hasta ${satMaxResults}`,
      });
    }
  }

  // Buscador SAT - Explicaciones IA
  if (satHasAIExplanations) {
    features.push({
      label: "Explicaciones de sugerencias IA",
      value: "Sí",
    });
  }

  // Buscador SAT - Historial
  if (satHasHistory) {
    features.push({ label: "Historial de búsquedas SAT", value: "Sí" });
  }

  // Buscador SAT - Favoritos
  if (satHasFavorites) {
    features.push({ label: "Favoritos SAT", value: "Sí" });
  }

  // Buscador SAT - Alertas
  if (satHasAlerts) {
    features.push({ label: "Alertas fiscales SAT", value: "Sí" });
  }

  // Buscador SAT - Aprendizaje
  if (satHasLearning) {
    features.push({ label: "Aprendizaje por RFC", value: "Sí" });
  }

  // Buscador SAT - Ranking avanzado
  if (satHasAdvancedRanking) {
    features.push({ label: "Ranking avanzado SAT", value: "Sí" });
  }

  return features;
}

/**
 * Obtiene información detallada de un plan desde AvailablePlan
 */
export function getPlanDetailsFromAvailable(
  plan: AvailablePlan
): PlanDetails {
  const features = generatePlanFeatures(plan.limits, plan.id);

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

