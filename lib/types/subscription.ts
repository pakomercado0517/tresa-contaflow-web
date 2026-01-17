export type Plan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED"
  | "PAST_DUE"
  | "UNPAID"
  | "TRIALING";

export interface Subscription {
  plan: Plan;
  status: SubscriptionStatus;
  planPrice: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export type GetSubscriptionResponse = Subscription;

export interface CreateCheckoutRequest {
  plan: "BASIC" | "PRO";
  promotionCode?: string;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
  message: string;
}

export interface CreatePortalSessionResponse {
  url: string;
  message: string;
}

