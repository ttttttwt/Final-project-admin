/**
 * Types for subscription management feature
 */

// Subscription plan
export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  planType: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stripePriceId: string | null;
  billingInterval: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  features: Record<string, unknown>;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrentlyEffective: boolean;
}

// Promo code
export interface PromoCodeDTO {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount: number | null;
  applicablePlanType: string | null;
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  isActive: boolean;
  stripeCouponId: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrentlyValid: boolean;
}

// Create plan request
export interface CreatePlanRequest {
  name: string;
  planType: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stripePriceId?: string;
  billingInterval?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  features?: Record<string, unknown>;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

// Create promo code request
export interface CreatePromoCodeRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  applicablePlanType?: string;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  maxUsesPerUser?: number;
}

// Subscription stats
export interface SubscriptionStats {
  totalPlans: number;
  activePlans: number;
  totalPromoCodes: number;
  activePromoCodes: number;
  validPromoCodes: number;
}

// Paginated promo codes response
export interface PagedPromoCodes {
  content: PromoCodeDTO[];
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

// Payment
export interface PaymentDTO {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionId: string | null;
  stripePaymentId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELED';
  paymentType: 'SUBSCRIPTION_NEW' | 'SUBSCRIPTION_RENEWAL' | 'SUBSCRIPTION_UPGRADE' | 'REFUND';
  description: string | null;
  createdAt: string;
  paidAt: string | null;
}

// Paginated payments response
export interface PagedPayments {
  content: PaymentDTO[];
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}
