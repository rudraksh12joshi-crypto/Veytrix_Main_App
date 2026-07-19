export type PlanTier = "free" | "pro" | "team";
export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: string;
  priceCents: number;
  cycle: BillingCycle;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  tier: PlanTier;
  active: boolean;
  renewsAt?: string;
  canceledAt?: string;
}
