import type { Plan } from "@/lib/types/subscription";

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
      { label: "Archivos XML / mes", value: 10 },
      { label: "Validación básica", value: "Sí" },
    ],
    xmlLimit: 10,
    profilesLimit: 1,
  },
  {
    id: "BASIC",
    name: "Básico",
    description: "Pequeños negocios en crecimiento.",
    price: {
      monthly: 299,
      annual: 239, // 20% descuento
    },
    icon: "Rocket",
    features: [
      { label: "RFCs Emisores", value: 3 },
      { label: "Archivos XML / mes", value: 100 },
      { label: "Descarga masiva XML", value: "Sí" },
      { label: "Reportes mensuales", value: "Sí" },
    ],
    xmlLimit: 100,
    profilesLimit: 3,
  },
  {
    id: "PRO",
    name: "Pro",
    description: "Contadores y despachos.",
    price: {
      monthly: 699,
      annual: 559, // 20% descuento
    },
    icon: "Gem",
    features: [
      { label: "RFCs Emisores", value: 10 },
      { label: "Archivos XML / mes", value: 1000 },
      { label: "Acceso a API", value: "Sí" },
      { label: "Soporte Prioritario", value: "Sí" },
    ],
    isPopular: true,
    xmlLimit: 1000,
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
      { label: "Archivos XML / mes", value: "5000+" },
      { label: "Multi-usuario (Roles)", value: "Sí" },
      { label: "Gerente de cuenta", value: "Sí" },
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

