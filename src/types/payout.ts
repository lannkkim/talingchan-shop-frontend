export interface Payout {
  payout_id: string;
  payout_code: string;
  shop_id: string;
  amount: string;
  fee: string;
  net_amount: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  bank_ref?: string;
  shop_bank_id?: string;
  requested_at: string;
  processed_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface RequestPayoutInput {
  amount: string;
  shop_bank_id?: string;
}

export interface AdminPayoutActionInput {
  bank_ref?: string;
  notes?: string;
}
