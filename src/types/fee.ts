export interface FeeRule {
  fee_rule_id: string;
  name: string;
  product_type_flag?: string;
  sell_type_code?: string;
  fee_type: "PERCENTAGE" | "FIXED";
  fee_value: string;
  paid_by: string;
  min_fee?: string;
  max_fee?: string;
  priority: number;
  is_active: boolean;
  effective_from?: string;
  effective_until?: string;
  created_at: string;
}

export interface CreateFeeRuleInput {
  name: string;
  product_type_flag?: string;
  sell_type_code?: string;
  fee_type: "PERCENTAGE" | "FIXED";
  fee_value: string;
  paid_by?: string;
  min_fee?: string;
  max_fee?: string;
  priority?: number;
  effective_from?: string;
  effective_until?: string;
}
