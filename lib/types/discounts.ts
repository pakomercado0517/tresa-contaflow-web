/**
 * Tipos para códigos de descuento
 */

export type DiscountDuration = "once" | "repeating" | "forever";
export type DiscountStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface DiscountCode {
  id: string;
  code: string;
  stripePromotionCodeId: string;
  stripeCouponId: string;
  status: DiscountStatus;
  active: boolean;
  expiresAt: string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  createdBy: string;
  metadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeRequest {
  code: string;
  duration: DiscountDuration;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  durationInMonths?: number;
  maxRedemptions?: number;
  expiresAt?: string;
  active?: boolean;
  metadata?: Record<string, string>;
}

export interface CreateDiscountCodeResponse {
  message: string;
  discountCode: DiscountCode;
}

export interface GetDiscountCodesResponse {
  data: DiscountCode[];
  count: number;
}

export interface ActivateDiscountCodeResponse {
  message: string;
  discountCode: DiscountCode;
}

export interface DeactivateDiscountCodeResponse {
  message: string;
  discountCode: DiscountCode;
}
