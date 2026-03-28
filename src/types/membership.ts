export interface MembershipPlan {
  membership_plan_id: string;
  name: string;
  description?: string;
  price: string;
  duration_days: number;
  benefits: string[];
  is_active: boolean;
}

export interface UserMembership {
  user_membership_id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  expires_at: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  plan?: MembershipPlan;
}

export interface PurchaseMembershipInput {
  plan_id: string;
}
